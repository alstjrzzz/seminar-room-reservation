"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Reservation } from "@/lib/types"

interface ReservationDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
}

export default function ReservationDetailsDialog({ open, onOpenChange, reservation }: ReservationDetailsDialogProps) {
  if (!reservation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>예약 정보</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">닉네임</p>
              <p className="font-medium">{reservation.nickname}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">예약 시간</p>
              <p className="font-medium">
                {reservation.startTime} - {reservation.endTime}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">사용 목적</p>
            <p className="break-words break-all">{reservation.purpose}</p>
          </div>
        </div>

        
      </DialogContent>
    </Dialog>
  )
}
