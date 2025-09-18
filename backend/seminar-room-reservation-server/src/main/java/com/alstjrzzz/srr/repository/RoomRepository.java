package com.alstjrzzz.srr.repository;

import com.alstjrzzz.srr.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<RoomEntity, Long> {

    @Query("SELECT DISTINCT r " +
            "FROM RoomEntity r " +
            "LEFT JOIN FETCH r.images")
    List<RoomEntity> findAllWithImages();
}
