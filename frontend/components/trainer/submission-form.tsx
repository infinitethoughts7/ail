"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTrainerSchools,
  useCurriculum,
  useSubmitSession,
} from "@/hooks/use-trainer-data";
import { CURRICULUM_DAYS } from "@/lib/constants";
import { toast } from "sonner";
import {
  Camera,
  X,
  Upload,
  Loader2,
  Clock,
  MapPin,
  Users,
  BookOpen,
  CheckCircle,
  ImagePlus,
  Info,
  Sparkles,
} from "lucide-react";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 3;

const STEPS = [
  { label: "Session", icon: BookOpen },
  { label: "Details", icon: MapPin },
  { label: "Photos", icon: Camera },
];

export function SubmissionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useTrainerSchools();
  const { data: curriculum } = useCurriculum();
  const submit = useSubmitSession();

  const [schoolId, setSchoolId] = useState("");
  const [dayNumber, setDayNumber] = useState("");
  const [reachedAtHour, setReachedAtHour] = useState("");
  const [reachedAtMinute, setReachedAtMinute] = useState("");
  const [reachedAtPeriod, setReachedAtPeriod] = useState<"AM" | "PM">("AM");
  const [studentCount, setStudentCount] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;

    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(
        `Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed, added first ${toAdd.length}`
      );
    }

    setPhotos((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Derive 24h time string for backend
  const reachedAt = reachedAtHour && reachedAtMinute
    ? (() => {
        let h = parseInt(reachedAtHour, 10);
        if (reachedAtPeriod === "PM" && h !== 12) h += 12;
        if (reachedAtPeriod === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${reachedAtMinute}`;
      })()
    : "";

  const canSubmit =
    schoolId &&
    dayNumber &&
    reachedAt &&
    studentCount &&
    photos.length >= MIN_PHOTOS &&
    !submit.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < MIN_PHOTOS) {
      toast.error(`Please upload at least ${MIN_PHOTOS} photos`);
      return;
    }

    const formData = new FormData();
    formData.append("school", schoolId);
    formData.append("day_number", dayNumber);
    formData.append("reached_at", reachedAt);
    formData.append("student_count", studentCount);

    const matchedCurriculum = curriculum?.find(
      (c) => c.day_number === parseInt(dayNumber)
    );
    if (matchedCurriculum) {
      formData.append("curriculum", matchedCurriculum.id);
    }

    formData.append("topics_covered", JSON.stringify([]));
    formData.append("trainer_notes", "");
    formData.append("challenges", "");

    photos.forEach((photo) => formData.append("photos", photo));

    submit.mutate(formData, {
      onSuccess: () => {
        toast.success("Session submitted successfully!");
        router.push("/trainer/submissions");
      },
      onError: (err) => {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Failed to submit session";
        toast.error(message);
      },
    });
  };

  const selectedDay = dayNumber
    ? CURRICULUM_DAYS.find((d) => d.day === parseInt(dayNumber))
    : null;

  // Progress calculation (3 steps now)
  const completedSteps = [
    !!dayNumber,
    !!(schoolId && reachedAt && studentCount),
    photos.length >= MIN_PHOTOS,
  ];
  const activeStep = completedSteps.findIndex((c) => !c);
  const progress = completedSteps.filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Progress Steps */}
      <div className="relative flex items-center justify-between px-4">
        {STEPS.map((step, i) => {
          const done = completedSteps[i];
          const active = i === activeStep;
          return (
            <div key={step.label} className="z-10 flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  done
                    ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                    : active
                      ? "bg-violet-100 text-violet-600 ring-2 ring-violet-500/30"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-4.5 w-4.5" />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  done
                    ? "text-violet-600"
                    : active
                      ? "text-gray-800"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
        {/* Connector lines */}
        <div className="absolute left-[calc(20%+20px)] right-[calc(20%+20px)] top-5 h-[2px] bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${(Math.max(progress - 1, 0) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Select Session */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-bold text-white">
            1
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Select Session</p>
            <p className="text-[11px] text-gray-400">Choose which session you are reporting</p>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {CURRICULUM_DAYS.map((day) => {
              const isSelected = dayNumber === day.day.toString();
              const topic = day.label.split(": ")[1] || day.label;
              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setDayNumber(day.day.toString())}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                    isSelected
                      ? "shadow-lg"
                      : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: day.hex,
                          backgroundColor: day.bgHex,
                          boxShadow: `0 8px 24px -4px ${day.hex}25`,
                        }
                      : undefined
                  }
                >
                  {isSelected && (
                    <div className="absolute right-2.5 top-2.5">
                      <CheckCircle
                        className="h-4.5 w-4.5"
                        style={{ color: day.hex }}
                      />
                    </div>
                  )}
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white`}
                    style={{ backgroundColor: day.hex }}
                  >
                    {day.day}
                  </div>
                  <p
                    className="text-[13px] font-bold"
                    style={isSelected ? { color: day.hex } : { color: "#1F2937" }}
                  >
                    Session {day.day}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 text-[11px] leading-snug"
                    style={
                      isSelected
                        ? { color: day.hex, opacity: 0.7 }
                        : { color: "#9CA3AF" }
                    }
                  >
                    {topic}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div
              className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ backgroundColor: selectedDay.bgHex }}
            >
              <Sparkles
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: selectedDay.hex }}
              />
              <p
                className="text-xs font-medium leading-relaxed"
                style={{ color: selectedDay.hex }}
              >
                {selectedDay.label}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Session Details */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-bold text-white">
            2
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Session Details</p>
            <p className="text-[11px] text-gray-400">
              School, arrival time & attendance
            </p>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          {/* School */}
          <div>
            <Label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100">
                <MapPin className="h-3 w-3 text-violet-600" />
              </div>
              School
            </Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/50 text-sm transition-colors focus:bg-white focus:ring-violet-500/20">
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reached Time */}
          <div>
            <Label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100">
                <Clock className="h-3 w-3 text-blue-600" />
              </div>
              Reached At
            </Label>
            <div className="flex items-center gap-2">
              <Select value={reachedAtHour} onValueChange={setReachedAtHour}>
                <SelectTrigger className="h-12 flex-1 rounded-xl border-gray-200 bg-gray-50/50 text-sm transition-colors focus:bg-white focus-visible:ring-violet-500/20">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return <SelectItem key={h} value={h}>{h}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <span className="text-lg font-semibold text-gray-400">:</span>
              <Select value={reachedAtMinute} onValueChange={setReachedAtMinute}>
                <SelectTrigger className="h-12 flex-1 rounded-xl border-gray-200 bg-gray-50/50 text-sm transition-colors focus:bg-white focus-visible:ring-violet-500/20">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i * 5).padStart(2, "0");
                    return <SelectItem key={m} value={m}>{m}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <Select value={reachedAtPeriod} onValueChange={(v) => setReachedAtPeriod(v as "AM" | "PM")}>
                <SelectTrigger className="h-12 w-20 rounded-xl border-gray-200 bg-gray-50/50 text-sm font-medium transition-colors focus:bg-white focus-visible:ring-violet-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Count */}
          <div>
            <Label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100">
                <Users className="h-3 w-3 text-emerald-600" />
              </div>
              Students
            </Label>
            <Input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="e.g. 57"
              min={1}
              required
              className="h-12 rounded-xl border-gray-200 bg-gray-50/50 text-sm transition-colors focus:bg-white focus-visible:ring-violet-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Photos */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-bold text-white">
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Session Photos</p>
              <p className="text-[11px] text-gray-400">
                Upload {MIN_PHOTOS}–{MAX_PHOTOS} clear photos of the session
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${
                  i < photos.length
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        <CardContent className="p-5">
          {/* Photo quality note */}
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-violet-50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
            <div className="text-[12px] leading-relaxed text-violet-700">
              <p className="font-semibold">Photo Guidelines</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-violet-600">
                <li>Upload minimum <strong>3</strong> and maximum <strong>5</strong> photos per session</li>
                <li>Ensure photos are <strong>clear and well-lit</strong> — avoid blurry or dark images</li>
                <li>Capture <strong>students actively participating</strong> in the session</li>
                <li>Include at least one <strong>wide shot</strong> of the classroom</li>
              </ul>
            </div>
          </div>

          {/* Photo previews */}
          {photoPreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {photoPreviews.map((preview, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/[0.06]"
                >
                  <img
                    src={preview}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform active:scale-90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed py-8 transition-all duration-200 active:scale-[0.98] ${
                photos.length === 0
                  ? "border-violet-300/50 bg-violet-50/30 hover:border-violet-400/60 hover:bg-violet-50/50"
                  : "border-gray-200 bg-gray-50/30 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  photos.length === 0
                    ? "bg-violet-100 shadow-sm shadow-violet-200/50"
                    : "bg-gray-100"
                }`}
              >
                <ImagePlus
                  className={`h-6 w-6 ${
                    photos.length === 0 ? "text-violet-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-semibold ${
                    photos.length === 0 ? "text-gray-800" : "text-gray-600"
                  }`}
                >
                  {photos.length === 0
                    ? "Add session photos"
                    : "Add more photos"}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {photos.length}/{MAX_PHOTOS} photos &middot; Tap to open camera
                </p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoAdd}
            className="hidden"
            capture="environment"
          />

          {photos.length > 0 && photos.length < MIN_PHOTOS && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 ring-1 ring-amber-200/50">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-xs font-medium text-amber-700">
                Add {MIN_PHOTOS - photos.length} more photo
                {MIN_PHOTOS - photos.length !== 1 ? "s" : ""} (minimum{" "}
                {MIN_PHOTOS} required)
              </p>
            </div>
          )}

          {photos.length >= MIN_PHOTOS && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-200/50">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs font-medium text-emerald-700">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} ready
                {photos.length < MAX_PHOTOS
                  ? ` — you can add ${MAX_PHOTOS - photos.length} more`
                  : ""}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 active:scale-[0.98] hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
        disabled={!canSubmit}
      >
        {submit.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Session {dayNumber || "..."} Report
          </span>
        )}
      </Button>
    </form>
  );
}
