package com.tripsyncai.repository;

import com.tripsyncai.entity.Expense;
import com.tripsyncai.entity.ExpenseSplit;
import com.tripsyncai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpense(Expense expense);
    List<ExpenseSplit> findByUser(User user);
}
