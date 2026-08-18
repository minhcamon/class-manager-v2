package com.classmanager.service;

import com.classmanager.dto.school.request.GroupImportConfirmRequest;
import com.classmanager.dto.school.response.GroupImportPreviewResponse;
import com.classmanager.dto.school.response.GroupImportResultResponse;
import com.classmanager.dto.school.response.GroupImportRowDto;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Enrollment;
import com.classmanager.entity.Group;
import com.classmanager.entity.StudentProfile;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.ClassNotFoundException;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupImportService {

    private final ClassRepository classRepository;
    private final GroupRepository groupRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;

    /**
     * Preview import data from an Excel (.xlsx, .xls) or CSV file without modifying database.
     */
    @Transactional(readOnly = true)
    public GroupImportPreviewResponse previewImport(Long teacherId, Integer classId, MultipartFile file) {
        ClassEntity classEntity = classRepository.findByIdWithTeacher(classId)
                .orElseThrow(ClassNotFoundException::new);

        validateTeacherPermission(classEntity, teacherId);

        if (file == null || file.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Vui lòng tải lên file Excel hoặc CSV.");
        }

        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        List<RawRowData> rawRows;

        try {
            if (filename.endsWith(".csv")) {
                rawRows = parseCsvFile(file);
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                rawRows = parseExcelFile(file);
            } else {
                throw new CustomException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_FILE_TYPE", "Định dạng file không hỗ trợ. Vui lòng tải file .xlsx, .xls hoặc .csv.");
            }
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse group import file", e);
            throw new CustomException(HttpStatus.BAD_REQUEST, "FILE_READ_ERROR", "Lỗi đọc file: " + e.getMessage());
        }

        // Fetch active enrollments in class for matching
        List<Enrollment> activeEnrollments = enrollmentRepository.findByClassEntityIdAndStatusWithUser(classId, EnrollmentStatus.ACTIVE);
        Map<String, Enrollment> enrollmentMap = buildEnrollmentLookupMap(activeEnrollments);

        // Fetch existing group names
        List<Group> existingGroups = groupRepository.findByClassEntityId(classId);
        Set<String> existingGroupNames = existingGroups.stream()
                .map(Group::getGroupName)
                .collect(Collectors.toSet());

        List<GroupImportRowDto> processedRows = new ArrayList<>();
        Set<String> newGroupNamesSet = new LinkedHashSet<>();
        Set<Integer> matchedStudentProfileIds = new HashSet<>();
        Map<String, List<Integer>> groupLeaderCountMap = new HashMap<>();

        int validCount = 0;
        int invalidCount = 0;

        for (RawRowData raw : rawRows) {
            GroupImportRowDto rowDto = GroupImportRowDto.builder()
                    .rowNumber(raw.rowNumber)
                    .studentIdentifier(raw.identifier)
                    .studentName(raw.studentName)
                    .groupName(raw.groupName)
                    .isLeader(raw.isLeader)
                    .build();

            // Match student
            Enrollment matchedEnrollment = findMatchingEnrollment(raw.identifier, raw.studentName, enrollmentMap);
            if (matchedEnrollment != null && matchedEnrollment.getStudentProfile() == null) {
                // Ensure profile is fetched/available
                Optional<StudentProfile> sp = studentProfileRepository.findByEnrollmentId(matchedEnrollment.getId());
                sp.ifPresent(matchedEnrollment::setStudentProfile);
            }

            if (matchedEnrollment == null || matchedEnrollment.getStudentProfile() == null) {
                rowDto.setStatus("STUDENT_NOT_FOUND");
                rowDto.setStatusMessage("Không tìm thấy học sinh trong lớp học");
                invalidCount++;
            } else {
                Integer profileId = matchedEnrollment.getStudentProfile().getId();
                rowDto.setStudentProfileId(profileId);
                if (matchedEnrollment.getUser() != null) {
                    rowDto.setStudentName(matchedEnrollment.getUser().getFullName());
                }

                if (matchedStudentProfileIds.contains(profileId)) {
                    rowDto.setStatus("DUPLICATE_STUDENT");
                    rowDto.setStatusMessage("Học sinh này xuất hiện nhiều lần trong file");
                    invalidCount++;
                } else if (raw.groupName == null || raw.groupName.trim().isEmpty()) {
                    rowDto.setStatus("MISSING_GROUP");
                    rowDto.setStatusMessage("Chưa nhập tên Tổ");
                    invalidCount++;
                } else {
                    rowDto.setStatus("VALID");
                    rowDto.setStatusMessage("Hợp lệ");
                    matchedStudentProfileIds.add(profileId);
                    validCount++;

                    String trimmedGroupName = raw.groupName.trim();
                    if (!existingGroupNames.contains(trimmedGroupName)) {
                        newGroupNamesSet.add(trimmedGroupName);
                    }

                    if (raw.isLeader) {
                        groupLeaderCountMap.computeIfAbsent(trimmedGroupName.toLowerCase(), k -> new ArrayList<>()).add(raw.rowNumber);
                    }
                }
            }
            processedRows.add(rowDto);
        }

        // Post-validation: Check for multiple leaders in same group
        for (GroupImportRowDto rowDto : processedRows) {
            if ("VALID".equals(rowDto.getStatus()) && rowDto.isLeader()) {
                String gNameLower = rowDto.getGroupName().trim().toLowerCase();
                List<Integer> leaderRows = groupLeaderCountMap.getOrDefault(gNameLower, Collections.emptyList());
                if (leaderRows.size() > 1) {
                    rowDto.setStatus("MULTIPLE_LEADERS");
                    rowDto.setStatusMessage("Tổ '" + rowDto.getGroupName() + "' có nhiều hơn 1 Tổ trưởng (Dòng: " + leaderRows + ")");
                    // Change status from valid to invalid
                    validCount--;
                    invalidCount++;
                }
            }
        }

        return GroupImportPreviewResponse.builder()
                .totalRows(rawRows.size())
                .validRows(validCount)
                .invalidRows(invalidCount)
                .newGroupsCount(newGroupNamesSet.size())
                .newGroupNames(new ArrayList<>(newGroupNamesSet))
                .rows(processedRows)
                .build();
    }

    /**
     * Execute actual group import transactionally.
     */
    @Transactional
    public GroupImportResultResponse executeImport(Long teacherId, Integer classId, GroupImportConfirmRequest request) {
        ClassEntity classEntity = classRepository.findByIdWithTeacher(classId)
                .orElseThrow(ClassNotFoundException::new);

        validateTeacherPermission(classEntity, teacherId);

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        if (request.getRows() == null || request.getRows().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "NO_DATA", "Không có dữ liệu hợp lệ để import.");
        }

        // Existing groups lookup
        List<Group> classGroups = groupRepository.findByClassEntityId(classId);
        Map<String, Group> groupMap = classGroups.stream()
                .collect(Collectors.toMap(g -> g.getGroupName().trim().toLowerCase(), g -> g, (a, b) -> a));

        int groupsCreatedCount = 0;
        int studentsAssignedCount = 0;
        int leadersAssignedCount = 0;
        Set<String> affectedGroupNames = new HashSet<>();

        // Group rows by target group name
        Map<String, List<GroupImportConfirmRequest.ConfirmRow>> rowsByGroup = new LinkedHashMap<>();
        for (GroupImportConfirmRequest.ConfirmRow row : request.getRows()) {
            if (row.getStudentProfileId() == null || row.getGroupName() == null || row.getGroupName().trim().isEmpty()) {
                continue;
            }
            String gName = row.getGroupName().trim();
            rowsByGroup.computeIfAbsent(gName, k -> new ArrayList<>()).add(row);
        }

        for (Map.Entry<String, List<GroupImportConfirmRequest.ConfirmRow>> entry : rowsByGroup.entrySet()) {
            String groupName = entry.getKey();
            String lowerName = groupName.toLowerCase();
            Group group = groupMap.get(lowerName);

            if (group == null) {
                if (!request.isCreateNewGroups()) {
                    continue;
                }
                group = Group.builder()
                        .classEntity(classEntity)
                        .groupName(groupName)
                        .build();
                group = groupRepository.save(group);
                groupMap.put(lowerName, group);
                groupsCreatedCount++;
            }

            affectedGroupNames.add(group.getGroupName());
            Enrollment leaderEnrollment = null;

            for (GroupImportConfirmRequest.ConfirmRow row : entry.getValue()) {
                StudentProfile studentProfile = studentProfileRepository.findById(row.getStudentProfileId())
                        .orElse(null);
                if (studentProfile == null) continue;

                Enrollment enrollment = studentProfile.getEnrollment();
                if (enrollment == null && studentProfile.getEnrollmentId() != null) {
                    enrollment = enrollmentRepository.findById(studentProfile.getEnrollmentId()).orElse(null);
                }
                if (enrollment == null) continue;

                // Clear previous leader status if this student was leader of another group
                Optional<Group> ledGroup = groupRepository.findByLeaderId(enrollment.getId());
                if (ledGroup.isPresent() && !ledGroup.get().getId().equals(group.getId())) {
                    Group prevG = ledGroup.get();
                    prevG.setLeader(null);
                    groupRepository.save(prevG);
                }

                enrollment.setGroup(group);
                enrollmentRepository.save(enrollment);
                studentsAssignedCount++;

                if (row.isLeader()) {
                    leaderEnrollment = enrollment;
                }
            }

            if (leaderEnrollment != null) {
                group.setLeader(leaderEnrollment);
                groupRepository.save(group);
                leadersAssignedCount++;
            }
        }

        return GroupImportResultResponse.builder()
                .groupsCreated(groupsCreatedCount)
                .studentsAssigned(studentsAssignedCount)
                .leadersAssigned(leadersAssignedCount)
                .groupNames(new ArrayList<>(affectedGroupNames))
                .message(String.format("Import thành công! Đã phân %d học sinh vào %d tổ (%d tổ mới tạo, %d tổ trưởng được chỉ định).",
                        studentsAssignedCount, affectedGroupNames.size(), groupsCreatedCount, leadersAssignedCount))
                .build();
    }

    /**
     * Generate standard Excel import template (.xlsx).
     */
    public byte[] generateTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import Danh Sach To");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Data Style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.LEFT);

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"STT", "Mã học sinh / Email", "Họ và tên", "Tên tổ", "Tổ trưởng (x/Có)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample Rows
            Object[][] sampleData = {
                    {1, "HS001", "Nguyễn Văn A", "Tổ 1", "x"},
                    {2, "HS002", "Trần Thị B", "Tổ 1", ""},
                    {3, "HS003", "Lê Văn C", "Tổ 1", ""},
                    {4, "HS004", "Phạm Hoàng D", "Tổ 2", "x"},
                    {5, "HS005", "Vũ Mỹ E", "Tổ 2", ""},
                    {6, "HS006", "Đặng Minh F", "Tổ 3", "x"}
            };

            for (int r = 0; r < sampleData.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < sampleData[r].length; c++) {
                    Cell cell = row.createCell(c);
                    Object val = sampleData[r][c];
                    if (val instanceof Integer) {
                        cell.setCellValue((Integer) val);
                    } else {
                        cell.setCellValue(String.valueOf(val));
                    }
                    cell.setCellStyle(dataStyle);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Excel template", e);
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "TEMPLATE_GEN_ERROR", "Lỗi tạo file mẫu Excel.");
        }
    }

    // --- Helper Methods ---

    private void validateTeacherPermission(ClassEntity classEntity, Long teacherId) {
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }
    }

    private Map<String, Enrollment> buildEnrollmentLookupMap(List<Enrollment> enrollments) {
        Map<String, Enrollment> map = new HashMap<>();
        for (Enrollment e : enrollments) {
            if (e.getUser() != null) {
                if (e.getUser().getUsername() != null) {
                    map.put(e.getUser().getUsername().trim().toLowerCase(), e);
                }
                if (e.getUser().getGoogleEmail() != null) {
                    map.put(e.getUser().getGoogleEmail().trim().toLowerCase(), e);
                }
                if (e.getUser().getFullName() != null) {
                    map.put(e.getUser().getFullName().trim().toLowerCase(), e);
                }
            }
        }
        return map;
    }

    private Enrollment findMatchingEnrollment(String identifier, String name, Map<String, Enrollment> lookupMap) {
        if (identifier != null && !identifier.trim().isEmpty()) {
            Enrollment found = lookupMap.get(identifier.trim().toLowerCase());
            if (found != null) return found;
        }
        if (name != null && !name.trim().isEmpty()) {
            return lookupMap.get(name.trim().toLowerCase());
        }
        return null;
    }

    private List<RawRowData> parseExcelFile(MultipartFile file) throws Exception {
        List<RawRowData> list = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) return list;

            // Skip header row
            Row headerRow = rowIterator.next();
            int rowNum = 1;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNum++;

                String col0 = getCellValueAsString(row.getCell(0));
                String col1 = getCellValueAsString(row.getCell(1));
                String col2 = getCellValueAsString(row.getCell(2));
                String col3 = getCellValueAsString(row.getCell(3));
                String col4 = getCellValueAsString(row.getCell(4));

                // If all cells empty, skip
                if (col0.isEmpty() && col1.isEmpty() && col2.isEmpty() && col3.isEmpty() && col4.isEmpty()) {
                    continue;
                }

                String identifier = col1.isEmpty() ? col2 : col1;
                String studentName = col2.isEmpty() ? col1 : col2;
                String groupName = col3;
                boolean isLeader = isLeaderFlag(col4);

                list.add(new RawRowData(rowNum, identifier, studentName, groupName, isLeader));
            }
        }
        return list;
    }

    private List<RawRowData> parseCsvFile(MultipartFile file) throws Exception {
        List<RawRowData> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int rowNum = 0;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                // Handle BOM on first line
                if (rowNum == 1) {
                    if (line.startsWith("\uFEFF")) {
                        line = line.substring(1);
                    }
                    // Skip header
                    continue;
                }

                if (line.trim().isEmpty()) continue;
                String[] tokens = line.split("[,;]");

                String col1 = tokens.length > 1 ? tokens[1].trim() : "";
                String col2 = tokens.length > 2 ? tokens[2].trim() : "";
                String col3 = tokens.length > 3 ? tokens[3].trim() : "";
                String col4 = tokens.length > 4 ? tokens[4].trim() : "";

                String identifier = col1.isEmpty() ? col2 : col1;
                String studentName = col2.isEmpty() ? col1 : col2;
                String groupName = col3;
                boolean isLeader = isLeaderFlag(col4);

                list.add(new RawRowData(rowNum, identifier, studentName, groupName, isLeader));
            }
        }
        return list;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }

    private boolean isLeaderFlag(String str) {
        if (str == null) return false;
        String val = str.trim().toLowerCase();
        return val.equals("x") || val.equals("có") || val.equals("co") || val.equals("true") || val.equals("1") || val.contains("trưởng");
    }

    private static class RawRowData {
        int rowNumber;
        String identifier;
        String studentName;
        String groupName;
        boolean isLeader;

        RawRowData(int rowNumber, String identifier, String studentName, String groupName, boolean isLeader) {
            this.rowNumber = rowNumber;
            this.identifier = identifier;
            this.studentName = studentName;
            this.groupName = groupName;
            this.isLeader = isLeader;
        }
    }
}
