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
import { Save, ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";

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
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    domain: "",
    skills: "",
    description: "",
  });
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [domainSelectValue, setDomainSelectValue] = useState("");

  useEffect(() => {
    if (isEdit && profileId) {
      const fetchProfile = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setError("프로필을 불러오는 중 오류가 발생했습니다.");
            setLoading(false);
            return;
          }

          if (data) {
            // domain이 배열인 경우와 단일 값인 경우 모두 처리
            let domains: string[] = [];
            if (Array.isArray(data.domain)) {
              domains = data.domain;
            } else if (data.domain) {
              domains = [data.domain];
            }

            setFormData({
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              position: data.position || "",
              experience: data.experience || "",
              domain: domains.length > 0 ? domains[0] : "",
              skills: data.skills?.join(", ") || "",
              description: data.description || "",
            });
            setSelectedDomains(domains);
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
      const supabase = createClient();

      // skills를 배열로 변환
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      // domain 처리: 항상 배열로 전송 (마이그레이션 후)
      const domainValue = selectedDomains.length > 0 ? selectedDomains : null;

      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        position: formData.position as "frontend" | "backend" | "fullstack" | "mobile" | "data" | "devops",
        experience: formData.experience as "junior" | "mid" | "senior" | "expert",
        domain: domainValue,
        skills: skillsArray,
        description: formData.description || null,
        match_score: 0,
      };

      console.log("Profile data to insert:", JSON.stringify(profileData, null, 2));

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
          console.error("Update error details:", {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
          });
          
          if (updateError.code === "23505" && updateError.message?.includes("email")) {
            setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
          } else if (updateError.message) {
            setError("인력 정보 수정 중 오류가 발생했습니다: " + updateError.message);
          } else if (updateError.details) {
            setError("인력 정보 수정 중 오류가 발생했습니다: " + updateError.details);
          } else {
            setError("인력 정보 수정 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
          }
          setSubmitting(false);
          return;
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

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profileData);

        if (insertError) {
          console.error("Insert error:", insertError);
          console.error("Insert error details:", {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          });
          
          if (insertError.code === "23505" && insertError.message?.includes("email")) {
            setError("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
          } else if (insertError.message) {
            setError("인력 등록 중 오류가 발생했습니다: " + insertError.message);
          } else if (insertError.details) {
            setError("인력 등록 중 오류가 발생했습니다: " + insertError.details);
          } else {
            setError("인력 등록 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
          }
          setSubmitting(false);
          return;
        }
      }

      // 성공 시 리다이렉트
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

  const handleDomainAdd = (value: string) => {
    if (value && !selectedDomains.includes(value)) {
      setSelectedDomains([...selectedDomains, value]);
      setDomainSelectValue("");
    }
  };

  const handleDomainRemove = (domainToRemove: string) => {
    setSelectedDomains(selectedDomains.filter((d) => d !== domainToRemove));
  };

  const domainLabels: Record<string, string> = {
    finance: "금융",
    ecommerce: "전자상거래",
    healthcare: "의료",
    education: "교육",
    manufacturing: "제조",
    logistics: "물류",
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>인력의 기본 정보를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="이름을 입력하세요"
                required
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
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="010-1234-5678"
                required
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>직무 및 경력</CardTitle>
            <CardDescription>직무와 경력 정보를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">직무 *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleChange("position", value)}
                required
              >
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="직무를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">프론트엔드 개발자</SelectItem>
                  <SelectItem value="backend">백엔드 개발자</SelectItem>
                  <SelectItem value="fullstack">풀스택 개발자</SelectItem>
                  <SelectItem value="mobile">모바일 개발자</SelectItem>
                  <SelectItem value="data">데이터 엔지니어</SelectItem>
                  <SelectItem value="devops">DevOps 엔지니어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">경력 *</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleChange("experience", value)}
                required
              >
                <SelectTrigger id="experience" className="w-full">
                  <SelectValue placeholder="경력을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">1-3년</SelectItem>
                  <SelectItem value="mid">3-5년</SelectItem>
                  <SelectItem value="senior">5-7년</SelectItem>
                  <SelectItem value="expert">7년 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">도메인 경험</Label>
              <Select
                value={domainSelectValue}
                onValueChange={handleDomainAdd}
              >
                <SelectTrigger id="domain" className="w-full">
                  <SelectValue placeholder="도메인을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance" disabled={selectedDomains.includes("finance")}>
                    금융
                  </SelectItem>
                  <SelectItem value="ecommerce" disabled={selectedDomains.includes("ecommerce")}>
                    전자상거래
                  </SelectItem>
                  <SelectItem value="healthcare" disabled={selectedDomains.includes("healthcare")}>
                    의료
                  </SelectItem>
                  <SelectItem value="education" disabled={selectedDomains.includes("education")}>
                    교육
                  </SelectItem>
                  <SelectItem value="manufacturing" disabled={selectedDomains.includes("manufacturing")}>
                    제조
                  </SelectItem>
                  <SelectItem value="logistics" disabled={selectedDomains.includes("logistics")}>
                    물류
                  </SelectItem>
                </SelectContent>
              </Select>
              {selectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDomains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      <span>{domainLabels[domain] || domain}</span>
                      <button
                        type="button"
                        onClick={() => handleDomainRemove(domain)}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
                        aria-label={`${domainLabels[domain] || domain} 제거`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기술 스택 및 설명</CardTitle>
          <CardDescription>보유 기술과 상세 설명을 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">기술 스택 (쉼표로 구분) *</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="예: React, TypeScript, Node.js"
              required
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              여러 기술을 쉼표로 구분하여 입력하세요.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="인력에 대한 상세 설명을 입력하세요"
              rows={5}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button asChild variant="outline">
          <Link href="/admin">취소</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              {isEdit ? "수정 중..." : "등록 중..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              {isEdit ? "수정하기" : "등록하기"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
