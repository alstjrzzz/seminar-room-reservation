"use client"

import { useState, useEffect } from "react"
import { format, isSameDay, startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ko } from "date-fns/locale"
import { Clock, ArrowRight, Plus, X } from "lucide-react"
import ReservationDialog from "@/components/reservation-dialog"
import CancellationDialog from "@/components/cancellation-dialog"
import ReservationDetailsDialog from "@/components/reservation-details-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Reservation, TimeBlock } from "@/lib/types"
import { generateTimeBlocks } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TimeBlockGridProps {
  selectedDate: Date
  reservations: Reservation[]
  onReservationUpdate: () => void
  isLoading: boolean
  selectedRoom?: string
}

export default function TimeBlockGrid({
  selectedDate,
  reservations,
  onReservationUpdate,
  isLoading,
  selectedRoom,
}: TimeBlockGridProps) {
  const { toast } = useToast()
  const [timeBlocks] = useState<TimeBlock[]>(generateTimeBlocks())
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const [isCancellationOpen, setIsCancellationOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailsReservation, setDetailsReservation] = useState<Reservation | null>(null)
  const [overlappingBlocks, setOverlappingBlocks] = useState<string[]>([])

  // Track selected blocks
  const [selectedBlocks, setSelectedBlocks] = useState<TimeBlock[]>([])

  // Track if selection is complete (2 blocks selected)
  const [selectionComplete, setSelectionComplete] = useState(false)

  const [isSelectionValid, setIsSelectionValid] = useState(false)
  const [exceededTimeLimit, setExceededTimeLimit] = useState(false)
  const [selectedHours, setSelectedHours] = useState(0)

  // Track start and end blocks for display
  const [startBlock, setStartBlock] = useState<TimeBlock | null>(null)
  const [endBlock, setEndBlock] = useState<TimeBlock | null>(null)

  const dateString = format(selectedDate, "yyyy-MM-dd")
  const today = startOfDay(new Date())
  const isToday = isSameDay(selectedDate, today)
  const currentTime = new Date()

  // Validate selection whenever selectedBlocks changes
  useEffect(() => {
    if (selectedBlocks.length === 0) {
      setIsSelectionValid(false)
      setExceededTimeLimit(false)
      setSelectedHours(0)
      setStartBlock(null)
      setEndBlock(null)
      setSelectionComplete(false)
      setOverlappingBlocks([])
      return
    }

    // For a single block selection, treat it as valid (1-hour reservation)
    if (selectedBlocks.length === 1) {
      setIsSelectionValid(true)
      setSelectedHours(1)
      setExceededTimeLimit(false)
      setStartBlock(selectedBlocks[0])
      setEndBlock(selectedBlocks[0])
      setSelectionComplete(false)

      // Check if the single block overlaps with existing reservations
      const isOverlapping = isBlockReserved(selectedBlocks[0])
      setIsSelectionValid(!isOverlapping)
      setOverlappingBlocks(isOverlapping ? [selectedBlocks[0].time] : [])
      return
    }

    // For two blocks, determine the range
    const block1Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[0].time)
    const block2Index = timeBlocks.findIndex((block) => block.time === selectedBlocks[1].time)

    // Determine start and end (order doesn't matter - we use min/max)
    const startIndex = Math.min(block1Index, block2Index)
    const endIndex = Math.max(block1Index, block2Index)

    // Set start and end blocks for display
    setStartBlock(timeBlocks[startIndex])
    setEndBlock(timeBlocks[endIndex])

    // Mark selection as complete
    setSelectionComplete(true)

    // Calculate hours (inclusive of both start and end)
    const hours = endIndex - startIndex + 1
    setSelectedHours(hours)

    // Check if exceeds 4-hour limit
    setExceededTimeLimit(hours > 4)

    // Check for overlapping blocks and track them
    const overlapping: string[] = []
    let hasReservedBlock = false

    for (let i = startIndex; i <= endIndex; i++) {
      const block = timeBlocks[i]
      const isReserved = isBlockReserved(block)

      if (isReserved) {
        hasReservedBlock = true
        overlapping.push(block.time)
      }
    }

    setOverlappingBlocks(overlapping)
    setIsSelectionValid(!hasReservedBlock)
  }, [selectedBlocks, timeBlocks, reservations, dateString])

  // Check if a single block is reserved
  const isBlockReserved = (block: TimeBlock): boolean => {
    return reservations.some((r) => r.date === dateString && r.startTime <= block.time && r.endTime > block.time)
  }

  const checkRangeForReservations = (startIndex: number, endIndex: number) => {
    for (let i = startIndex; i <= endIndex; i++) {
      const block = timeBlocks[i]
      if (isBlockReserved(block)) return true
    }
    return false
  }

  // Get the end time of a block (which is the start time of the next block)
  const getBlockEndTime = (timeBlock: TimeBlock): string => {
    const blockIndex = timeBlocks.findIndex((b) => b.time === timeBlock.time)
    const nextBlockIndex = blockIndex + 1

    if (nextBlockIndex < timeBlocks.length) {
      return timeBlocks[nextBlockIndex].time
    } else {
      // Handle the case of the last block (e.g., 23:00 -> 24:00)
      return "24:00"
    }
  }

  // Check if a time block is in the past (only relevant for today)
  const isBlockInPast = (timeBlock: TimeBlock) => {
    if (!isToday) return false

    // Get the end time of this block
    const endTime = getBlockEndTime(timeBlock)

    // Parse the end time
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    // Current time
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    // Special handling for 24:00 - it's always in the future on the same day
    if (endHours === 24) {
      return false
    }

    // Block is in the past if its end time is earlier than the current time
    return endHours < currentHour || (endHours === currentHour && endMinutes <= currentMinute)
  }

  // Check if a reservation is in the past
  const isReservationInPast = (reservation: Reservation) => {
    if (!isToday) return false

    // Parse the end time
    const [endHours, endMinutes] = reservation.endTime.split(":").map(Number)

    // Current time
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    // Special handling for 24:00 - it's always in the future on the same day
    if (endHours === 24) {
      return false
    }

    // Reservation is in the past if its end time is earlier than the current time
    return endHours < currentHour || (endHours === currentHour && endMinutes <= currentMinute)
  }

  // Check if a time block is before 08:00 on today's date
  const isBlockBeforeStartTime = (timeBlock: TimeBlock) => {
    if (!isToday) return false

    // Parse the block's start time
    const [hours] = timeBlock.time.split(":").map(Number)

    // Block is before start time if its hour is less than 8
    return hours < 8
  }

  const handleTimeBlockClick = (timeBlock: TimeBlock) => {
    // Don't allow clicking on past time blocks or blocks before start time
    if (isBlockInPast(timeBlock) || isBlockBeforeStartTime(timeBlock)) return

    // If selection is complete (2 blocks already selected), reset and start with this block
    if (selectionComplete) {
      setSelectedBlocks([timeBlock])
      return
    }

    // If the block is already selected, remove it
    if (selectedBlocks.some((block) => block.time === timeBlock.time)) {
      setSelectedBlocks(selectedBlocks.filter((block) => block.time !== timeBlock.time))
      return
    }

    // Add the new block to the selection
    setSelectedBlocks([...selectedBlocks, timeBlock])
  }

  const handleReservationClick = () => {
    if (!isSelectionValid) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid time range with no existing reservations.",
        variant: "destructive",
      })
      return
    }

    if (exceededTimeLimit) {
      toast({
        title: "Time Limit Exceeded",
        description: "You can reserve up to 4 hours only. Please select a shorter time range.",
        variant: "destructive",
      })
      return
    }

    setIsReservationOpen(true)
  }

  const handleReservationCancel = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCancellationOpen(true)
  }

  const handleShowDetails = (reservation: Reservation) => {
    setDetailsReservation(reservation)
    setIsDetailsOpen(true)
  }

  const handleAddReservation = (newReservation: Reservation) => {
    setIsReservationOpen(false)
    setSelectedBlocks([])

    // Fetch updated reservations after successful reservation
    onReservationUpdate()

    toast({
      title: "예약이 완료되었습니다.",
      description: `${format(selectedDate, "M월 d일", { locale: ko })} ${newReservation.startTime}부터 ${newReservation.endTime}까지의 예약이 완료되었습니다.`,
    })
  }

  const handleCancellationComplete = (success: boolean) => {
    if (success) {
      // Fetch updated reservations after successful cancellation
      onReservationUpdate()
      setSelectedReservation(null)
    }
  }

  const getReservationForBlock = (timeBlock: TimeBlock) => {
    return reservations.find(
      (r) => r.date === dateString && r.startTime <= timeBlock.time && r.endTime > timeBlock.time,
    )
  }

  const isBlockInSelectedRange = (timeBlock: TimeBlock) => {
    if (!startBlock || !endBlock) return false

    const blockIndex = timeBlocks.findIndex((block) => block.time === timeBlock.time)
    const startIndex = timeBlocks.findIndex((block) => block.time === startBlock.time)
    const endIndex = timeBlocks.findIndex((block) => block.time === endBlock.time)

    return blockIndex >= startIndex && blockIndex <= endIndex
  }

  // Check if a block is in the overlapping blocks array
  const isBlockOverlapping = (timeBlock: TimeBlock) => {
    return overlappingBlocks.includes(timeBlock.time)
  }

  // Format time for display
  const formatTimeDisplay = (block: TimeBlock, isEnd = false) => {
    if (isEnd) {
      return getBlockEndTime(block)
    }
    return block.time
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          {selectedBlocks.length > 0 && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {startBlock && endBlock && (
                <div className="flex items-center">
                  <span className="font-medium">{formatTimeDisplay(startBlock)}</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span className="font-medium">{formatTimeDisplay(endBlock, true)}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({selectedHours}시간)
                  </span>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Time blocks */}
      <div className="grid grid-cols-1 gap-2 mb-20">
        {(() => { const hasOverlap = overlappingBlocks.length > 0; return timeBlocks.map((block) => {
          const reservation = getReservationForBlock(block)
          const isReserved = !!reservation
          const isPast = isBlockInPast(block)
          const isBeforeStartTime = isBlockBeforeStartTime(block)
          const isSelected = selectedBlocks.some((selectedBlock) => selectedBlock.time === block.time)
          const isInRange = isBlockInSelectedRange(block)
          const isDisabled = isReserved || isPast || isBeforeStartTime
          const isReservationPast = reservation ? isReservationInPast(reservation) : false

          return (
            <div
              key={block.time}
              className={`p-3 rounded-md border transition-colors ${
                isDisabled
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : isSelected
                    ? exceededTimeLimit || hasOverlap
                      ? "bg-red-100 border-red-400"
                      : "bg-green-100 border-green-400"
                    : isInRange
                      ? (hasOverlap || exceededTimeLimit)
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200"
                      : "hover:bg-accent hover:cursor-pointer"
              }`}
              onClick={() => !isDisabled && handleTimeBlockClick(block)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {block.label}
                  {isBeforeStartTime && !isPast && <span className="ml-2 text-sm text-gray-500">(Before 08:00)</span>}
                </div>

                {isReserved ? (
                  <div className="flex items-center gap-2">
                    {isReservationPast ? (
                      <div className="flex-1"></div> // Empty div to maintain layout
                    ) : (
                      <>
                        <span className="font-medium text-sm">{reservation.nickname}</span>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShowDetails(reservation)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReservationCancel(reservation)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center"></div>
                )}
              </div>
            </div>
          )
        })})()}
      </div>

      {/* Fixed reservation button */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-10 px-4 pointer-events-none">
          <Button
              size="lg"
              className="shadow-lg  pointer-events-auto"
              disabled={!isSelectionValid || exceededTimeLimit || overlappingBlocks.length > 0}
              onClick={handleReservationClick}
          >
              {overlappingBlocks.length > 0
                  ? "예약 시간이 중복됩니다."
                  : exceededTimeLimit
                  ? "예약 시간은 4시간을 초과할 수 없습니다."
                  : "예약하기"}
          </Button>
      </div>

      <ReservationDialog
        open={isReservationOpen}
        onOpenChange={setIsReservationOpen}
        selectedDate={selectedDate}
        selectedBlocks={selectedBlocks}
        timeBlocks={timeBlocks}
        existingReservations={reservations}
        onReservation={handleAddReservation}
        onReservationUpdate={onReservationUpdate}
        selectedRoomId={selectedRoom}
      />

      <CancellationDialog
        open={isCancellationOpen}
        onOpenChange={setIsCancellationOpen}
        selectedReservation={selectedReservation}
        onCancel={handleCancellationComplete}
      />

      <ReservationDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} reservation={detailsReservation} />
    </div>
  )
}
