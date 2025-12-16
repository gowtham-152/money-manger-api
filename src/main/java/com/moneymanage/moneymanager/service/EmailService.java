package com.moneymanage.moneymanager.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username")
    private String fromEmail;
    void sendEmail(String to, String subject, String body){
        try{
            //Simple Email Message for plain text
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom(fromEmail);
//            message.setTo(to);
//            message.setSubject(subject);
//            message.setText(body);
//            mailSender.send(message);

            // HTML based email sent
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML
            helper.setFrom("no-reply@moneymanager.com");

            mailSender.send(mimeMessage);
        }
        catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }
}
