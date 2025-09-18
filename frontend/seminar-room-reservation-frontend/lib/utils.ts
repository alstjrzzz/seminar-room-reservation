import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Reservation, TimeBlock } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTimeBlocks(): TimeBlock[] {
  const blocks: TimeBlock[] = []

  for (let hour = 8; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`
    const nextHour = (hour + 1) % 24

    // Use 24:00 instead of 00:00 for the last block
    const endTime = nextHour === 0 ? "24:00" : `${nextHour.toString().padStart(2, "0")}:00`

    blocks.push({
      time,
      label: `${time} - ${endTime}`,
    })
  }

  return blocks
}

export function getHoursDifference(startTime: string, endTime: string): number {
  const startHour = Number.parseInt(startTime.split(":")[0], 10)
  let endHour = Number.parseInt(endTime.split(":")[0], 10)

  // If end hour is 24, keep it as 24 for calculation
  if (endHour === 0 || endHour === 24) {
    endHour = 24
  }

  return endHour - startHour
}