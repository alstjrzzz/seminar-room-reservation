package com.alstjrzzz.srr.repository;

import com.alstjrzzz.srr.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {

    @Query("SELECT r " +
            "FROM ReservationEntity r " +
            "WHERE r.room.id = :roomId " +
            "AND r.startTime BETWEEN :start AND :end")
    List<ReservationEntity> findReservationsByRoomAndDateRange(@Param("roomId") Long roomId,
                                                               @Param("start") LocalDateTime start,
                                                               @Param("end") LocalDateTime end);

    @Query("SELECT r " +
            "FROM ReservationEntity r " +
            "WHERE r.room.id = :roomId " +
            "AND r.startTime < :endTime " +
            "AND r.endTime > :startTime")
    List<ReservationEntity> findConflictingReservations(@Param("roomId") Long roomId,
                                                        @Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r " +
            "FROM ReservationEntity r " +
            "LEFT JOIN FETCH r.room")
    List<ReservationEntity> findAllWithRoom();
}
