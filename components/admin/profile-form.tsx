"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Loader2, X, Upload, FileText, FileInput, PenLine } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileFormProps {
  profileId?: string;
}

export function ProfileForm({ profileId }: ProfileFormProps) {
  const router = useRouter();
  const isEdit = !!profileId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name_ko: "",
    name_en: "",
    email: "",
    phone: "",
    job_grade: "",
    team: "",
    education_school: "",
    education: "",
    position_role: "",
    skills: "",
    career_description: "",
  });
  const [employmentHistory, setEmploymentHistory] = useState<{ industry: string }[]>([]);
  const [projectCareers, setProjectCareers] = useState<{ project_name: string }[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"file" | "form">("file");

  useEffect(() => {
    if (isEdit && profileId) {
      const fetchProfile = async () => {
        try {
          const supabase = createClient();
          const [{ data, error }, { data: projects }, { data: careers }] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", profileId).single(),
            supabase.from("profile_projects").select("industry").eq("profile_id", profileId).order("created_at", { ascending: false }),
            supabase.from("profile_project_careers").select("project_name").eq("profile_id", profileId).order("created_at", { ascending: false }),
          ]);

          if (error) {
            console.error("Error fetching profile:", error);
            setError("프로필을 불러오는 중 오류가 발생했습니다.");
            setLoading(false);
            return;
          }

          if (data) {
            setFormData({
              name_ko: data.name_ko || "",
              name_en: data.name_en || "",
              email: data.email || "",
              phone: data.phone || "",
              job_grade: data.job_grade || "",
              team: data.team || "",
              education_school: data.education_school || "",
              education: data.education || "",
              position_role: data.position_role || "",
              skills: data.skills?.join(", ") || "",
              career_description: data.career_description || "",
            });
          }
          if (projects && projects.length > 0) {
            setEmploymentHistory(projects.map((p) => ({ industry: p.industry || "" })));
          }
          if (careers && careers.length > 0) {
            setProjectCareers(careers.map((c) => ({ project_name: (c as { project_name: string }).project_name || "" })));
          }
        } catch (err) {
          console.error("Error:", err);
          setError("프로필을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [isEdit, profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 신규 등록 · 파일 업로드 탭: n8n으로 전송
      if (!isEdit && activeTab === "file") {
        if (!uploadFile || uploadFile.size === 0) {
          setError("이력서·프로필 파일을 선택해 주세요.");
          setSubmitting(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", uploadFile);
        const res = await fetch("/api/n8n/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error || "파일 전송에 실패했습니다.");
          setSubmitting(false);
          return;
        }
        router.push("/admin");
        router.refresh();
        return;
      }

      const supabase = createClient();

      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const profileData = {
        name_ko: formData.name_ko.trim() || "",
        name_en: formData.name_en.trim() || null,
        email: formData.email,
        phone: formData.phone || null,
        job_grade: formData.job_grade || null,
        team: formData.team.trim() || null,
        education_school: formData.education_school.trim() || null,
        education: formData.education || null,
        position_role: formData.position_role.trim() || null,
        skills: skillsArray,
        career_description: formData.career_description.trim() || null,
        match_score: 0,
      };

      if (isEdit && profileId) {
        // 수정 - 이메일 중복 확인 (다른 프로필의 이메일과 중복되지 않는지)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", profileId)
          .single();

        // 이메일이 변경된 경우에만 중복 확인
        if (existingProfile && existingProfile.email !== formData.email) {
          const { data: duplicateCheck } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", formData.email)
            .neq("id", profileId)
            .single();

          if (duplicateCheck) {
            setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
            setSubmitting(false);
            return;
          }
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileId);

        if (updateError) {
          console.error("Update error:", updateError);
          if (updateError.code === "23505" && updateError.message?.includes("email")) {
            setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
          } else {
            setError("인력 정보 수정 중 오류가 발생했습니다: " + (updateError.message || ""));
          }
          setSubmitting(false);
          return;
        }
        const toInsert = employmentHistory.filter((e) => e.industry.trim());
        await supabase.from("profile_projects").delete().eq("profile_id", profileId);
        if (toInsert.length > 0) {
          await supabase.from("profile_projects").insert(toInsert.map((e) => ({
            profile_id: profileId,
            project_name: "",
            industry: e.industry.trim() || "",
            duration: "",
          })));
        }
        const toInsertCareers = projectCareers.filter((c) => c.project_name.trim());
        await supabase.from("profile_project_careers").delete().eq("profile_id", profileId);
        if (toInsertCareers.length > 0) {
          await supabase.from("profile_project_careers").insert(toInsertCareers.map((c) => ({
            profile_id: profileId,
            project_name: c.project_name.trim() || "",
          })));
        }
      } else {
        // 등록 - 이메일 중복 확인
        const { data: duplicateCheck } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", formData.email)
          .single();

        if (duplicateCheck) {
          setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
          setSubmitting(false);
          return;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert(profileData)
          .select("id")
          .single();

        if (insertError) {
          // Supabase 에러 객체가 {}로 찍히는 경우 대비: message/code 직접 추출
          const errMsg =
            (insertError as { message?: string }).message ??
            (insertError as { details?: string }).details ??
            JSON.stringify(insertError, Object.getOwnPropertyNames(insertError));
          const errCode = (insertError as { code?: string }).code;

          console.error("Insert error:", errMsg, "code:", errCode);
          console.error("Insert error raw:", JSON.stringify(insertError, Object.getOwnPropertyNames(insertError)));

          if (errCode === "23505" && String(errMsg).includes("email")) {
            setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
          } else if (errMsg) {
            setError("인력 등록 중 오류가 발생했습니다: " + errMsg);
          } else {
            setError("인력 등록 중 오류가 발생했습니다. Supabase 마이그레이션(006) 적용 여부를 확인해주세요.");
          }
          setSubmitting(false);
          return;
        }
        const newId = inserted?.id;
        const toInsert = employmentHistory.filter((e) => e.industry.trim());
        if (newId && toInsert.length > 0) {
          await supabase.from("profile_projects").insert(toInsert.map((e) => ({
            profile_id: newId,
            project_name: "",
            industry: e.industry.trim() || "",
            duration: "",
          })));
        }
        const toInsertCareers = projectCareers.filter((c) => c.project_name.trim());
        if (newId && toInsertCareers.length > 0) {
          await supabase.from("profile_project_careers").insert(toInsertCareers.map((c) => ({
            profile_id: newId,
            project_name: c.project_name.trim() || "",
          })));
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError("처리 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addEmployment = () => {
    setEmploymentHistory((prev) => [...prev, { industry: "" }]);
  };
  const removeEmployment = (index: number) => {
    setEmploymentHistory((prev) => prev.filter((_, i) => i !== index));
  };
  const updateEmployment = (index: number, value: string) => {
    setEmploymentHistory((prev) => prev.map((e, i) => (i === index ? { ...e, industry: value } : e)));
  };
  const addProjectCareer = () => {
    setProjectCareers((prev) => [...prev, { project_name: "" }]);
  };
  const removeProjectCareer = (index: number) => {
    setProjectCareers((prev) => prev.filter((_, i) => i !== index));
  };
  const updateProjectCareer = (index: number, value: string) => {
    setProjectCareers((prev) => prev.map((e, i) => (i === index ? { ...e, project_name: value } : e)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
          {error}
        </div>
      )}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon" aria-label="뒤로 가기">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">
            {isEdit ? "인력 정보 수정" : "새 인력 등록"}
          </h2>
        </div>
      </div>

      {!isEdit ? (
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "file" | "form"); setError(""); }} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2" aria-label="등록 방식 선택">
            <TabsTrigger value="file" className="gap-2">
              <FileInput className="h-4 w-4 shrink-0" aria-hidden="true" />
              이력서·파일로 등록
            </TabsTrigger>
            <TabsTrigger value="form" className="gap-2">
              <PenLine className="h-4 w-4 shrink-0" aria-hidden="true" />
              직접 입력으로 등록
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  이력서·프로필 파일 업로드
                </CardTitle>
                <CardDescription>
                  이력서 또는 프로필 파일을 올리면 자동으로 파싱한 뒤 인력 목록에 등록됩니다. PDF, DOC/DOCX, PPT/PPTX, TXT 지원.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">파일 선택</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setUploadFile(f ?? null);
                      }}
                      className="max-w-xs"
                      aria-describedby="file-upload-help"
                    />
                    {uploadFile && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm">
                        <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate max-w-[180px]">{uploadFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded p-0.5 transition-colors"
                          aria-label="파일 제거"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p id="file-upload-help" className="text-xs text-muted-foreground">
                    파일을 선택한 뒤 아래 &quot;등록하기&quot;를 눌러 주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              아래 입력란에 인력 정보를 직접 입력한 뒤 &quot;등록하기&quot;를 눌러 주세요.
            </p>
          </TabsContent>
        </Tabs>
      ) : null}

      {/* 수정 모드이거나, 신규 등록 시 '직접 입력으로 등록' 탭일 때만 폼 필드 표시 */}
      {(isEdit || activeTab === "form") && (
      <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>이름, 연락처, 직급, 소속, 학력을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_ko">한글이름 *</Label>
              <Input
                id="name_ko"
                value={formData.name_ko}
                onChange={(e) => handleChange("name_ko", e.target.value)}
                placeholder="홍길동"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">영문이름</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                placeholder="Gildong Hong"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="010-1234-5678"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_grade">직급</Label>
              <Select value={formData.job_grade} onValueChange={(v) => handleChange("job_grade", v)}>
                <SelectTrigger id="job_grade" className="w-full">
                  <SelectValue placeholder="직급을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="사원">사원</SelectItem>
                  <SelectItem value="대리">대리</SelectItem>
                  <SelectItem value="과장">과장</SelectItem>
                  <SelectItem value="차장">차장</SelectItem>
                  <SelectItem value="부장">부장</SelectItem>
                  <SelectItem value="실장">실장</SelectItem>
                  <SelectItem value="이사">이사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">소속팀</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => handleChange("team", e.target.value)}
                placeholder="예: 개발1팀"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education_school">학교명</Label>
              <Input
                id="education_school"
                value={formData.education_school}
                onChange={(e) => handleChange("education_school", e.target.value)}
                placeholder="예: 연세대학교 신문방송학과"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">최종학력 (고졸/전문학사/학사/석사/박사)</Label>
              <Select value={formData.education} onValueChange={(v) => handleChange("education", v)}>
                <SelectTrigger id="education" className="w-full">
                  <SelectValue placeholder="최종학력을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="고졸">고졸</SelectItem>
                  <SelectItem value="전문학사">전문학사</SelectItem>
                  <SelectItem value="학사">학사</SelectItem>
                  <SelectItem value="석사">석사</SelectItem>
                  <SelectItem value="박사">박사</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>직무 및 기술 스택</CardTitle>
            <CardDescription>직무와 기술 스택을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position_role">직무</Label>
              <Input
                id="position_role"
                value={formData.position_role}
                onChange={(e) => handleChange("position_role", e.target.value)}
                placeholder="예: 프론트엔드 개발자, 데이터 엔지니어"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">기술 스택 (쉼표로 구분)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                placeholder="예: React, TypeScript, Node.js"
                className="w-full"
              />
            </div>
            <div className="space-y-2" style={{ display: "none" }}>
              <Label htmlFor="career_description">경력 기술서 (한 줄당 리스트 항목)</Label>
              <Textarea
                id="career_description"
                value={formData.career_description}
                onChange={(e) => handleChange("career_description", e.target.value)}
                placeholder="프로젝트 경력을 그대로 입력하세요. 한 줄당 하나의 항목으로 표시됩니다.&#10;예:&#10;KB카드 모바일 앱 개발 (2022.02-2023.05)&#10;신한은행 웹뱅킹 시스템 (2020.01-2022.05)"
                rows={6}
                className="resize-none font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>재직이력</CardTitle>
            <CardDescription>회사명만 입력하세요. (예: Concentrix Service Korea, 삼성전자)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employmentHistory.map((row, index) => (
              <div key={index} className="flex items-end gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1 min-w-[180px] space-y-1">
                  <Label className="text-xs">회사명</Label>
                  <Input
                    value={row.industry}
                    onChange={(e) => updateEmployment(index, e.target.value)}
                    placeholder="예: Concentrix Service Korea"
                    className="h-9"
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeEmployment(index)} aria-label="재직이력 행 제거">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEmployment}>
              재직 추가
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>프로젝트 경력</CardTitle>
            <CardDescription>프로젝트명을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectCareers.map((row, index) => (
              <div key={index} className="flex items-end gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1 min-w-[180px] space-y-1">
                  <Label className="text-xs">프로젝트명</Label>
                  <Input
                    value={row.project_name}
                    onChange={(e) => updateProjectCareer(index, e.target.value)}
                    placeholder="예: KB카드 모바일 앱"
                    className="h-9"
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeProjectCareer(index)} aria-label="프로젝트 경력 행 제거">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addProjectCareer}>
              프로젝트 추가
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button asChild variant="outline">
          <Link href="/admin">취소</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              {isEdit ? "수정 중..." : activeTab === "file" ? "전송 중..." : "등록 중..."}
            </>
          ) : (
            <>
              {!isEdit && activeTab === "file" ? (
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              {isEdit ? "수정하기" : "등록하기"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
