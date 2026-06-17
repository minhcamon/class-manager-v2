# API Integration Test Script for ClassManager Feature 1
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080/api/v1"
$username = "testteacher_" + (Get-Random)
$password = "SecretPassword123"
$phoneNumber = "09876543" + (Get-Random -Minimum 10 -Maximum 99)
$fullName = "Test Teacher"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STARTING API INTEGRATION TESTS FOR FEATURE 1" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Username to test: $username" -ForegroundColor Yellow
Write-Host "Phone to test: $phoneNumber" -ForegroundColor Yellow
Write-Host ""

# 1. Register User
Write-Host "1. Registering user..." -ForegroundColor Cyan
$regBody = @{
    username = $username
    password = $password
    phoneNumber = $phoneNumber
    fullName = $fullName
} | ConvertTo-Json

try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Register Result: Success!" -ForegroundColor Green
    Write-Host ($regRes | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "Register Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}

# 2. Login User
Write-Host "`n2. Logging in..." -ForegroundColor Cyan
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    # We want to capture cookies, so we use Invoke-WebRequest
    $loginRes = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable session -UseBasicParsing
    $loginData = $loginRes.Content | ConvertFrom-Json
    $token = $loginData.data.accessToken
    Write-Host "Login Result: Success! Token acquired." -ForegroundColor Green
    Write-Host ($loginData | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Call protected endpoint (Should fail with ROLE_NOT_SELECTED)
Write-Host "`n3. Accessing protected endpoint /schools before selecting role (Expect 403 ROLE_NOT_SELECTED)..." -ForegroundColor Cyan
try {
    $meHeaders = @{ Authorization = "Bearer $token" }
    $meRes = Invoke-WebRequest -Uri "$baseUrl/schools" -Method Get -Headers $meHeaders -UseBasicParsing
    Write-Host "Unexpected Success! Me Res: $($meRes.Content)" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "Expected Failure received." -ForegroundColor Green
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream.CanSeek) { $stream.Position = 0 }
    $reader = New-Object System.IO.StreamReader($stream)
    $errBody = $reader.ReadToEnd()
    $reader.Close()
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error Body: $errBody" -ForegroundColor Gray
    if ($errBody -match "ROLE_NOT_SELECTED") {
        Write-Host "PASS: Auth Guard blocked access with ROLE_NOT_SELECTED!" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Did not receive ROLE_NOT_SELECTED" -ForegroundColor Red
        exit 1
    }
}

# 4. Select Role (Select TEACHER)
Write-Host "`n4. Selecting role: TEACHER..." -ForegroundColor Cyan
$roleBody = @{
    role = "TEACHER"
} | ConvertTo-Json

try {
    $roleHeaders = @{ Authorization = "Bearer $token" }
    $roleRes = Invoke-RestMethod -Uri "$baseUrl/auth/select-role" -Method Put -Headers $roleHeaders -Body $roleBody -ContentType "application/json"
    Write-Host "Role selection Result: Success!" -ForegroundColor Green
    Write-Host ($roleRes | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "Role selection Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}

# 4.5 Refresh token to get updated claims (role)
Write-Host "`n4.5 Refreshing token to get updated claims (with selected role)..." -ForegroundColor Cyan
try {
    $refreshRes = Invoke-WebRequest -Uri "$baseUrl/auth/refresh" -Method Post -WebSession $session -UseBasicParsing
    $refreshData = $refreshRes.Content | ConvertFrom-Json
    $token = $refreshData.data.accessToken
    Write-Host "Token Refreshed! New token acquired with updated role claim." -ForegroundColor Green
} catch {
    Write-Host "Refresh Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}

# 5. Accessing a dummy deep protected endpoint (should fail with PROFILE_INCOMPLETE because schoolId is null)
# Since we don't have deep endpoints yet, we can test /schools itself which is allowed (TEACHER can access /schools to create one)
# Wait, JwtAuthFilter blocks access to deep resources for TEACHER if schoolId is null.
# Let's test if we call GET /me with a fresh token. Wait, /me is allowed for role selection, but what about other deep endpoints?
# In JwtAuthFilter: "if (role == Role.TEACHER && schoolId == null) { if (!path.equals('/api/v1/schools') && !path.equals('/api/v1/auth/me') && !path.equals('/api/v1/auth/select-role')) { throw PROFILE_INCOMPLETE } }"
# Let's try calling a random non-whitelisted path like /api/v1/students to verify PROFILE_INCOMPLETE!
Write-Host "`n5. Accessing deep resource /students as TEACHER with no school (Expect 403 PROFILE_INCOMPLETE)..." -ForegroundColor Cyan
try {
    $dummyHeaders = @{ Authorization = "Bearer $token" }
    $dummyRes = Invoke-WebRequest -Uri "$baseUrl/students" -Method Get -Headers $dummyHeaders -UseBasicParsing
    Write-Host "Unexpected Success! Dummy Res: $($dummyRes.Content)" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "Expected Failure received." -ForegroundColor Green
    $statusCode = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream.CanSeek) { $stream.Position = 0 }
    $reader = New-Object System.IO.StreamReader($stream)
    $errBody = $reader.ReadToEnd()
    $reader.Close()
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error Body: $errBody" -ForegroundColor Gray
    if ($errBody -match "PROFILE_INCOMPLETE") {
        Write-Host "PASS: Auth Guard blocked access with PROFILE_INCOMPLETE!" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Did not receive PROFILE_INCOMPLETE" -ForegroundColor Red
        exit 1
    }
}

# 6. Create School (POST /api/v1/schools) - This should succeed and auto link to teacher
Write-Host "`n6. Creating school as TEACHER..." -ForegroundColor Cyan
$schoolBody = @{
    name = "High School of Antigravity"
    address = "123 Quantum St, DeepMind City"
} | ConvertTo-Json

try {
    $schoolHeaders = @{ Authorization = "Bearer $token" }
    $schoolRes = Invoke-RestMethod -Uri "$baseUrl/schools" -Method Post -Headers $schoolHeaders -Body $schoolBody -ContentType "application/json"
    Write-Host "School creation Result: Success!" -ForegroundColor Green
    Write-Host ($schoolRes | ConvertTo-Json -Depth 5) -ForegroundColor Gray
    $newSchoolId = $schoolRes.data.schoolId
} catch {
    Write-Host "School creation Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Error Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}

# 7. Check Profile me (Should now show role=TEACHER and schoolId set)
Write-Host "`n7. Accessing /me now that school is linked (Should succeed and show schoolId)..." -ForegroundColor Cyan
try {
    $meHeaders = @{ Authorization = "Bearer $token" }
    $meRes = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $meHeaders
    Write-Host "Profile Fetch Result: Success!" -ForegroundColor Green
    Write-Host ($meRes | ConvertTo-Json -Depth 5) -ForegroundColor Gray
    if ($meRes.data.schoolId -eq $newSchoolId) {
        Write-Host "PASS: School successfully linked to teacher profile!" -ForegroundColor Green
    } else {
        Write-Host "FAIL: School ID mismatch on profile!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Profile Fetch Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "ALL INTEGRATION TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
