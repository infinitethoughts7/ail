"use client";

import { SubmissionForm } from "@/components/trainer/submission-form";
import { SubmissionList } from "@/components/trainer/submission-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrainerFormPage() {
  return (
    <div>
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="submit" className="flex-1">New Submission</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">My Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="submit">
          <SubmissionForm />
        </TabsContent>
        <TabsContent value="history">
          <SubmissionList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
