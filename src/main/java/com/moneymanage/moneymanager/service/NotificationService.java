package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.ExpenseDTO;
import com.moneymanage.moneymanager.dto.IncomeDTO;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.property.access.internal.PropertyAccessFieldImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;

    @Value("${money-manager.frontend.url}")
    private String frontendUrl;

    @Scheduled(cron = "0 0 8 * * *",zone = "IST")
    public void sendDailyIncomeExpenseRemainder(){
        log.info("Job Started : sendDailyIncomeExpenseRemainder()");
        List<ProfileEntity> profiles = profileRepository.findAll();
        for(ProfileEntity profile : profiles){
            String body =
                    "Hi <b>" + profile.getFullName() + "</b>,<br><br>" +

                            "This is your friendly daily reminder to keep track of your finances 📊.<br><br>" +

                            "<b>Why this matters?</b><br>" +
                            "• Tracking income helps you understand your cash flow<br>" +
                            "• Tracking expenses keeps your spending under control<br>" +
                            "• Small daily entries lead to better monthly savings<br><br>" +

                            "📅 <b>Date:</b> " + LocalDate.now() + "<br><br>" +

                            "Please log today’s <b>income</b> and <b>expenses</b> in the Money Manager app.<br><br>" +

                            "👉 Staying consistent today builds financial freedom tomorrow 💰<br><br>" +

                            "Best regards,<br>" +
                            "<b>Money Manager Team</b>";

            emailService.sendEmail(profile.getEmail(),"Daily Remainder: Add Income and Expense",body);

            log.info("Job Ended: sendDailyIncomeExpenseRemainder()");
        }
    }
    @Scheduled(cron = "0 0 8 * * *",zone = "IST")
    public void sendDailyExpenseSummary(){
        log.info("Job Started: sendDailyExpenseSummary()");
        List<ProfileEntity> profiles = profileRepository.findAll();
//      ZoneId.of("Asia/Kolkata")
        for(ProfileEntity profile : profiles){
            List<ExpenseDTO> todayExpenses =
                    expenseService.getExpensesForUserOnDate(
                            profile.getId(),
                            LocalDate.now()
                    );


            if (todayExpenses.isEmpty()) {
                continue;
            }

            StringBuilder body = new StringBuilder();

            body.append("Hi ").append(profile.getFullName()).append(",<br><br>");
            body.append("Here is your income and expense summary for today:<br><br>");

            body.append("<table border='1' cellpadding='5' cellspacing='0'>");
            body.append("<tr>");
            body.append("<th>Date</th>");
            body.append("<th>Category</th>");
            body.append("<th>Description</th>");
            body.append("<th>Amount</th>");
            body.append("</tr>");

            BigDecimal total = BigDecimal.ZERO;

            for (ExpenseDTO e : todayExpenses) {
                body.append("<tr>");
                body.append("<td>").append(e.getDate()).append("</td>");
                body.append("<td>").append(e.getCategoryName()).append("</td>");
                body.append("<td>").append(e.getName()).append("</td>");
                body.append("<td>₹ ").append(e.getAmount()).append("</td>");
                body.append("</tr>");

                total = total.add(e.getAmount());
            }


            body.append("<tr>");
            body.append("<td colspan='3'><b>Total</b></td>");
            body.append("<td><b>₹ ").append(total).append("</b></td>");
            body.append("</tr>");

            body.append("</table><br><br>");
            body.append("Regards,<br>");
            body.append("Money Manager Team");

            emailService.sendEmail(
                    profile.getEmail(),
                    "Daily Expense Summary",
                    body.toString()
            );
        }
        log.info("Job Ended: sendDailyExpenseSummary");
    }

}
