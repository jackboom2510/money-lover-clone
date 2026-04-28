'use client'
import ReportSection from '@/components/dialog/report-section'

export default function ReportSectionClient({ userId }: { userId: string }) {
  return <ReportSection userId={userId} />
}
