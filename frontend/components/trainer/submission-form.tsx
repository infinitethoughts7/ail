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
import { Badge } from "@/components/ui/badge";
import { useSchools, useCurriculum, useSubmitSession } from "@/hooks/use-trainer-data";
import { getDayTheme, CURRICULUM_DAYS } from "@/lib/constants";
import { toast } from "sonner";
import { Camera, X, Upload, Loader2 } from "lucide-react";

export function SubmissionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useSchools();
  const { data: curriculum } = useCurriculum();
  const submit = useSubmitSession();

  const [schoolId, setSchoolId] = useState("");
  const [dayNumber, setDayNumber] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [topicsCovered, setTopicsCovered] = useState("");
  const [trainerNotes, setTrainerNotes] = useState("");
  const [challenges, setChallenges] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 12) {
      toast.error("Maximum 12 photos allowed");
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length < 3) {
      toast.error("Please upload at least 3 photos");
      return;
    }

    const formData = new FormData();
    formData.append("school", schoolId);
    formData.append("day_number", dayNumber);
    formData.append("student_count", studentCount);

    // Match curriculum if available
    const matchedCurriculum = curriculum?.find(
      (c) => c.day_number === parseInt(dayNumber)
    );
    if (matchedCurriculum) {
      formData.append("curriculum", matchedCurriculum.id);
    }

    // Topics as JSON array
    const topics = topicsCovered
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.append("topics_covered", JSON.stringify(topics));

    formData.append("trainer_notes", trainerNotes);
    formData.append("challenges", challenges);

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

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

  const selectedDayTheme = dayNumber ? getDayTheme(parseInt(dayNumber)) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Curriculum Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CURRICULUM_DAYS.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => setDayNumber(day.day.toString())}
                className={`rounded-xl border-2 p-3 text-center transition-all ${
                  dayNumber === day.day.toString()
                    ? `${day.borderColor} ${day.bgLight} ring-2 ring-offset-1`
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <span className={`text-lg font-bold ${day.textColor}`}>
                  {day.shortLabel}
                </span>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {day.label.split(": ")[1]}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School & Student Count */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">School</Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name} ({school.district_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">Student Count</Label>
            <Input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="Number of students"
              min={1}
              required
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm">
              Topics Covered (comma-separated)
            </Label>
            <Input
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="AI basics, Machine learning, ..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Photos ({photos.length}/12)
            </CardTitle>
            {selectedDayTheme && (
              <Badge
                variant="outline"
                className={`${selectedDayTheme.bgLight} ${selectedDayTheme.textColor}`}
              >
                Min 3 required
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Photo grid */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {photoPreviews.map((preview, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border"
              >
                <img
                  src={preview}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {photos.length < 12 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground/70"
              >
                <div className="text-center">
                  <Camera className="mx-auto h-6 w-6" />
                  <span className="mt-1 block text-[10px]">Add Photo</span>
                </div>
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
          />

          {photos.length < 3 && (
            <p className="text-xs text-orange-600">
              Please upload at least 3 photos to submit.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Trainer Notes</Label>
            <Textarea
              value={trainerNotes}
              onChange={(e) => setTrainerNotes(e.target.value)}
              placeholder="How did the session go? Key observations..."
              rows={3}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Challenges</Label>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Any challenges faced during the session..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          submit.isPending ||
          !schoolId ||
          !dayNumber ||
          !studentCount ||
          photos.length < 3
        }
      >
        {submit.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Submit Session
          </span>
        )}
      </Button>
    </form>
  );
}
