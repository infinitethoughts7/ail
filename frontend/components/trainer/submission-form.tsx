"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSchools, useCurriculum, useSubmitSession } from "@/hooks/use-trainer-data";
import { CURRICULUM_DAYS } from "@/lib/constants";
import { toast } from "sonner";
import { Camera, X, Upload, Loader2, Clock, MapPin, Users } from "lucide-react";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 3;

export function SubmissionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useSchools();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step 1: Select Day */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2DD4A8] text-[10px] font-bold text-white">1</span>
            Select Day
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-2.5">
            {CURRICULUM_DAYS.map((day) => {
              const isSelected = dayNumber === day.day.toString();
              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setDayNumber(day.day.toString())}
                  className={`rounded-xl border-2 px-2 py-3.5 text-center transition-all ${
                    isSelected
                      ? "shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  style={
                    isSelected
                      ? { borderColor: day.hex, backgroundColor: day.bgHex }
                      : undefined
                  }
                >
                  <span
                    className="text-base font-bold"
                    style={isSelected ? { color: day.hex } : undefined}
                  >
                    Day {day.day}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {selectedDay.label}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: School, Time, Students */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2DD4A8] text-[10px] font-bold text-white">2</span>
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* School */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              School
            </Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="h-11 rounded-xl">
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
              <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Reached At
              </Label>
              <Input
                type="time"
                value={reachedAt}
                onChange={(e) => setReachedAt(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            {/* Student Count */}
            <div>
              <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Students Present
              </Label>
              <Input
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                placeholder="e.g. 57"
                min={1}
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Photos */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2DD4A8] text-[10px] font-bold text-white">3</span>
              Photos ({photos.length}/{MAX_PHOTOS})
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              Min {MIN_PHOTOS}, Max {MAX_PHOTOS}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {photoPreviews.map((preview, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border"
              >
                <img
                  src={preview}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-opacity active:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {i + 1}
                </span>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors active:border-muted-foreground/50 active:bg-muted/50 hover:border-muted-foreground/40"
              >
                <Camera className="h-6 w-6" />
                <span className="mt-1 text-[10px] font-medium">
                  Add
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoAdd}
            className="hidden"
            capture="environment"
          />

          {photos.length < MIN_PHOTOS && (
            <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-600 dark:bg-orange-950/30">
              Upload at least {MIN_PHOTOS - photos.length} more photo{MIN_PHOTOS - photos.length !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Notes (optional) */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300">4</span>
            Notes
            <span className="font-normal text-muted-foreground">(optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Topics Covered</Label>
            <Input
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="AI basics, Machine learning, ..."
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Session Notes</Label>
            <Textarea
              value={trainerNotes}
              onChange={(e) => setTrainerNotes(e.target.value)}
              placeholder="How did the session go?"
              rows={2}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Challenges</Label>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Any issues faced..."
              rows={2}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base font-semibold shadow-sm"
        disabled={!canSubmit}
      >
        {submit.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Submit Day {dayNumber || "..."} Report
          </span>
        )}
      </Button>
    </form>
  );
}
