"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrainerSchools, useCurriculum, useSubmitSession } from "@/hooks/use-trainer-data";
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
  MessageSquare,
  CheckCircle,
  ImagePlus,
} from "lucide-react";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 3;

const STEPS = [
  { label: "Day", icon: BookOpen },
  { label: "Details", icon: MapPin },
  { label: "Photos", icon: Camera },
  { label: "Notes", icon: MessageSquare },
];

export function SubmissionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useTrainerSchools();
  const { data: curriculum } = useCurriculum();
  const submit = useSubmitSession();

  const [schoolId, setSchoolId] = useState("");
  const [dayNumber, setDayNumber] = useState("");
  const [reachedAt, setReachedAt] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [topicsCovered, setTopicsCovered] = useState("");
  const [trainerNotes, setTrainerNotes] = useState("");
  const [challenges, setChallenges] = useState("");
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
      toast.info(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed, added first ${toAdd.length}`);
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

  const canSubmit =
    schoolId && dayNumber && reachedAt && studentCount && photos.length >= MIN_PHOTOS && !submit.isPending;

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

    const topics = topicsCovered
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.append("topics_covered", JSON.stringify(topics));
    formData.append("trainer_notes", trainerNotes);
    formData.append("challenges", challenges);

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

  // Progress calculation
  const completedSteps = [
    !!dayNumber,
    !!(schoolId && reachedAt && studentCount),
    photos.length >= MIN_PHOTOS,
    true, // Notes are optional, always "done"
  ];
  const activeStep = completedSteps.findIndex((c) => !c);
  const progress = completedSteps.filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {STEPS.map((step, i) => {
          const done = completedSteps[i];
          const active = i === activeStep;
          return (
            <div key={step.label} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  done
                    ? "bg-[#2DD4A8] text-white"
                    : active
                      ? "bg-[#0F4C4C] text-white shadow-md"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? (
                  <CheckCircle className="h-4.5 w-4.5" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  done || active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2DD4A8] to-[#0F4C4C] transition-all duration-500"
          style={{ width: `${(progress / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Select Day */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F4C4C] text-[10px] font-bold text-white">
            1
          </div>
          <p className="text-sm font-semibold">Select Day</p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CURRICULUM_DAYS.map((day) => {
              const isSelected = dayNumber === day.day.toString();
              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setDayNumber(day.day.toString())}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 text-center transition-all active:scale-[0.97] ${
                    isSelected
                      ? "shadow-md"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: day.hex, backgroundColor: day.bgHex }
                      : undefined
                  }
                >
                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <CheckCircle className="h-4 w-4" style={{ color: day.hex }} />
                    </div>
                  )}
                  <span
                    className="block text-2xl font-bold"
                    style={isSelected ? { color: day.hex } : undefined}
                  >
                    {day.day}
                  </span>
                  <span
                    className="mt-0.5 block text-[11px] font-medium"
                    style={isSelected ? { color: day.hex } : { color: "var(--muted-foreground)" }}
                  >
                    Day {day.day}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <div
              className="mt-3 rounded-xl px-3.5 py-2.5 text-xs font-medium"
              style={{ backgroundColor: selectedDay.bgHex, color: selectedDay.hex }}
            >
              {selectedDay.label}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Session Details */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F4C4C] text-[10px] font-bold text-white">
            2
          </div>
          <p className="text-sm font-semibold">Session Details</p>
        </div>
        <CardContent className="space-y-4 p-4">
          {/* School */}
          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/50">
                <MapPin className="h-3 w-3 text-violet-600" />
              </div>
              School
            </Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="h-12 rounded-xl text-sm">
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

          <div className="grid grid-cols-2 gap-3">
            {/* Reached Time */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
                Reached At
              </Label>
              <Input
                type="time"
                value={reachedAt}
                onChange={(e) => setReachedAt(e.target.value)}
                required
                className="h-12 rounded-xl text-sm"
              />
            </div>

            {/* Student Count */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-100 dark:bg-cyan-900/50">
                  <Users className="h-3 w-3 text-cyan-600" />
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
                className="h-12 rounded-xl text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Photos */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F4C4C] text-[10px] font-bold text-white">
              3
            </div>
            <p className="text-sm font-semibold">Photos</p>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  i < photos.length ? "bg-[#2DD4A8]" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <CardContent className="p-4">
          {/* Photo previews */}
          {photoPreviews.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photoPreviews.map((preview, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-2xl border"
                >
                  <img
                    src={preview}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity active:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-[10px] font-bold text-white">
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
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition-colors active:bg-muted/50 ${
                photos.length === 0
                  ? "border-[#0F4C4C]/30 bg-[#0F4C4C]/[0.02]"
                  : "border-muted-foreground/20"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                photos.length === 0 ? "bg-[#0F4C4C]/10" : "bg-muted"
              }`}>
                <ImagePlus className={`h-6 w-6 ${
                  photos.length === 0 ? "text-[#0F4C4C]" : "text-muted-foreground"
                }`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {photos.length === 0 ? "Add session photos" : "Add more photos"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {photos.length}/{MAX_PHOTOS} photos · Tap to open camera
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
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3.5 py-2.5 dark:bg-orange-950/30">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                Add {MIN_PHOTOS - photos.length} more photo{MIN_PHOTOS - photos.length !== 1 ? "s" : ""} (minimum {MIN_PHOTOS})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Notes (optional) */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            4
          </div>
          <p className="text-sm font-semibold">Notes</p>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        <CardContent className="space-y-4 p-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Topics Covered</Label>
            <Input
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="AI basics, Machine learning, ..."
              className="h-12 rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Session Notes</Label>
            <Textarea
              value={trainerNotes}
              onChange={(e) => setTrainerNotes(e.target.value)}
              placeholder="How did the session go?"
              rows={3}
              className="rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Challenges</Label>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Any issues faced..."
              rows={3}
              className="rounded-xl text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="h-14 w-full rounded-2xl bg-[#0F4C4C] text-base font-semibold shadow-lg shadow-[#0F4C4C]/20 transition-all active:scale-[0.98] hover:bg-[#0F4C4C]/90"
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
            Submit Day {dayNumber || "..."} Report
          </span>
        )}
      </Button>
    </form>
  );
}
