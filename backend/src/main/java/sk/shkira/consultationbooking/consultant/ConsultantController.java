package sk.shkira.consultationbooking.consultant;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/consultants")
public class ConsultantController {

    private final ConsultantService consultantService;

    @GetMapping
    public List<Consultant> getConsultants() {
        return consultantService.getConsultants();
    }
}
