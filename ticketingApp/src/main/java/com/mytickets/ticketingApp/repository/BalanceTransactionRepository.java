package com.mytickets.ticketingApp.repository;

import com.mytickets.ticketingApp.model.BalanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BalanceTransactionRepository extends JpaRepository<BalanceTransaction, Long> {
    List<BalanceTransaction> findByUserIdOrderByTransactionDateDesc(Long userId);
}