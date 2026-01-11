// INFER Study Assignment Website
// This website collects student IDs and assigns them to study groups (alpha/beta/gamma)

// ============================================================================
// Supabase Configuration - UPDATE THESE FOR YOUR DATABASE
// ============================================================================
const SUPABASE_URL = 'https://cvmzsljalmkrehfkqjtc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bXpzbGphbG1rcmVoZmtxanRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTM5MzIsImV4cCI6MjA3OTE2OTkzMn0.0IxG1T574aCCH6pxfn8tgGrzw3XUuDKFPE8YQQkV9T4';

// Study group URLs - UPDATE THESE WITH YOUR ACTUAL DEPLOYED URLs
const STUDY_GROUP_URLS = {
    'treatment_1': 'https://infer-study-alpha.onrender.com',  // Alpha
    'treatment_2': 'https://infer-study-beta.onrender.com',  // Beta
    'control': 'https://infer-study-gamma.onrender.com'      // Gamma
};

// ============================================================================

let supabase = null;

// Initialize Supabase
function initSupabase() {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialized');
        return supabase;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertId = `alert-${Date.now()}`;
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Show page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('d-none');
    }
}

// Randomly assign to one of three groups
function randomAssignGroup() {
    const groups = ['treatment_1', 'treatment_2', 'control'];
    const randomIndex = Math.floor(Math.random() * groups.length);
    return groups[randomIndex];
}

// Check if student is already assigned (case-insensitive)
async function checkExistingAssignment(studentId) {
    if (!supabase) return null;
    
    // Normalize student ID to uppercase for consistent matching
    const normalizedId = studentId.trim().toUpperCase();
    
    try {
        // Query with exact match (student_id is stored in uppercase)
        const { data, error } = await supabase
            .from('student_assignments')
            .select('*')
            .eq('student_id', normalizedId)  // Exact match (already normalized to uppercase)
            .single();
        
        if (error && error.code !== 'PGRST116') {  // PGRST116 = no rows returned
            console.error('Error checking assignment:', error);
            return null;
        }
        
        return data;  // Returns null if not found, or the assignment object if found
    } catch (error) {
        console.error('Error in checkExistingAssignment:', error);
        return null;
    }
}

// Check localStorage for existing assignment (for returning users)
function getStoredAssignment(studentId) {
    try {
        const normalizedId = studentId.trim().toUpperCase();
        const stored = localStorage.getItem(`assignment_${normalizedId}`);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading stored assignment:', error);
    }
    return null;
}

// Store assignment in localStorage
function storeAssignment(studentId, assignment) {
    try {
        const normalizedId = studentId.trim().toUpperCase();
        localStorage.setItem(`assignment_${normalizedId}`, JSON.stringify(assignment));
    } catch (error) {
        console.error('Error storing assignment:', error);
    }
}

// Create or get assignment (robust version with case-insensitive matching)
async function getOrCreateAssignment(studentId, anonymousId) {
    if (!supabase) {
        showAlert('Database connection error. Please refresh the page.', 'danger');
        return null;
    }
    
    // Normalize student ID to uppercase for consistent storage and matching
    const normalizedId = studentId.trim().toUpperCase();
    const normalizedAnonymousId = anonymousId.trim().toUpperCase();
    
    // First check localStorage (fast, for returning users)
    const stored = getStoredAssignment(normalizedId);
    if (stored && stored.treatment_group) {
        console.log('Found stored assignment:', stored);
        // Verify it still exists in database
        const dbAssignment = await checkExistingAssignment(normalizedId);
        if (dbAssignment) {
            return dbAssignment;
        }
    }
    
    // Check database for existing assignment (case-insensitive)
    const existing = await checkExistingAssignment(normalizedId);
    
    if (existing) {
        console.log('Found existing assignment in database:', existing);
        // Store in localStorage for faster future access
        storeAssignment(normalizedId, existing);
        return existing;
    }
    
    // Create new assignment with random group
    const treatmentGroup = randomAssignGroup();
    
    try {
        const { data, error } = await supabase
            .from('student_assignments')
            .insert([{
                student_id: normalizedId,  // Store in uppercase for consistency
                anonymous_id: normalizedAnonymousId,
                treatment_group: treatmentGroup
            }])
            .select()
            .single();
        
        if (error) {
            // If error is due to duplicate (race condition), try to fetch existing
            if (error.code === '23505') {  // Unique violation
                console.log('Duplicate detected, fetching existing assignment...');
                const existing = await checkExistingAssignment(normalizedId);
                if (existing) {
                    storeAssignment(normalizedId, existing);
                    return existing;
                }
            }
            console.error('Error creating assignment:', error);
            showAlert('Error creating assignment. Please try again.', 'danger');
            return null;
        }
        
        console.log('Created new assignment:', data);
        // Store in localStorage for faster future access
        storeAssignment(normalizedId, data);
        return data;
    } catch (error) {
        console.error('Error in getOrCreateAssignment:', error);
        showAlert('Error creating assignment. Please try again.', 'danger');
        return null;
    }
}

// Redirect to appropriate study site
function redirectToStudySite(treatmentGroup) {
    const url = STUDY_GROUP_URLS[treatmentGroup];
    if (!url) {
        showAlert('Invalid study group. Please contact the administrator.', 'danger');
        return;
    }
    
    // Redirect to the study site
    window.location.href = url;
}

// Handle consent form
function setupConsentForm() {
    const dataProtectionCheckbox = document.getElementById('data-protection-read');
    const consentAgree = document.getElementById('data-consent-agree');
    const consentDisagree = document.getElementById('data-consent-disagree');
    const continueBtn = document.getElementById('continue-to-id');
    const disagreementMessage = document.getElementById('consent-disagreement-message');
    
    function updateContinueButton() {
        const dataProtectionChecked = dataProtectionCheckbox?.checked || false;
        const consentSelected = consentAgree?.checked || consentDisagree?.checked;
        
        if (continueBtn) {
            continueBtn.disabled = !(dataProtectionChecked && consentSelected);
        }
        
        // Show/hide disagreement message
        if (disagreementMessage) {
            if (consentDisagree?.checked) {
                disagreementMessage.classList.remove('d-none');
            } else {
                disagreementMessage.classList.add('d-none');
            }
        }
    }
    
    if (dataProtectionCheckbox) {
        dataProtectionCheckbox.addEventListener('change', updateContinueButton);
    }
    
    if (consentAgree) {
        consentAgree.addEventListener('change', updateContinueButton);
    }
    
    if (consentDisagree) {
        consentDisagree.addEventListener('change', updateContinueButton);
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            showPage('page-id-assignment');
        });
    }
}

// Check if user is returning (has assignment stored)
async function checkReturningUser() {
    // Check URL parameters first (if redirected from assignment)
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdParam = urlParams.get('student_id');
    
    if (studentIdParam) {
        const normalizedId = studentIdParam.trim().toUpperCase();
        const stored = getStoredAssignment(normalizedId);
        if (stored && stored.treatment_group) {
            // Verify in database
            const dbAssignment = await checkExistingAssignment(normalizedId);
            if (dbAssignment) {
                console.log('Returning user detected, redirecting...');
                redirectToStudySite(dbAssignment.treatment_group);
                return true;
            }
        }
    }
    
    return false;
}

// Handle ID assignment form
function setupAssignmentForm() {
    const studentIdInput = document.getElementById('student-id-input');
    const anonymousIdInput = document.getElementById('anonymous-id-input');
    const submitBtn = document.getElementById('submit-assignment');
    const loadingSpinner = document.getElementById('loading-spinner');
    const assignmentInfo = document.getElementById('assignment-info');
    const assignmentMessage = document.getElementById('assignment-message');
    
    function updateSubmitButton() {
        const studentId = studentIdInput?.value.trim();
        const anonymousId = anonymousIdInput?.value.trim();
        
        if (submitBtn) {
            submitBtn.disabled = !(studentId && anonymousId);
        }
    }
    
    if (studentIdInput) {
        studentIdInput.addEventListener('input', updateSubmitButton);
        
        // Check for existing assignment when student ID is entered
        studentIdInput.addEventListener('blur', async () => {
            const studentId = studentIdInput?.value.trim();
            if (studentId) {
                const normalizedId = studentId.toUpperCase();
                const stored = getStoredAssignment(normalizedId);
                if (stored && stored.treatment_group) {
                    // Show message that they're already assigned
                    if (assignmentMessage) {
                        const groupNames = {
                            'treatment_1': 'Group Alpha (INFER + Tutorial)',
                            'treatment_2': 'Group Beta (INFER Only)',
                            'control': 'Group Gamma (Simple Feedback)'
                        };
                        assignmentMessage.textContent = `You are already assigned to: ${groupNames[stored.treatment_group] || stored.treatment_group}. Click "Continue to Study" to proceed.`;
                    }
                    if (assignmentInfo) assignmentInfo.classList.remove('d-none');
                }
            }
        });
    }
    
    if (anonymousIdInput) {
        anonymousIdInput.addEventListener('input', updateSubmitButton);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const studentId = studentIdInput?.value.trim();
            const anonymousId = anonymousIdInput?.value.trim().toUpperCase();
            
            if (!studentId || !anonymousId) {
                showAlert('Please fill in all fields.', 'warning');
                return;
            }
            
            // Show loading
            if (loadingSpinner) loadingSpinner.classList.remove('d-none');
            if (submitBtn) submitBtn.disabled = true;
            if (assignmentInfo) assignmentInfo.classList.add('d-none');
            
            try {
                // Get or create assignment
                const assignment = await getOrCreateAssignment(studentId, anonymousId);
                
                if (!assignment) {
                    showAlert('Failed to create assignment. Please try again.', 'danger');
                    if (loadingSpinner) loadingSpinner.classList.add('d-none');
                    if (submitBtn) submitBtn.disabled = false;
                    return;
                }
                
                // Show assignment info
                const groupNames = {
                    'treatment_1': 'Group Alpha (INFER + Tutorial)',
                    'treatment_2': 'Group Beta (INFER Only)',
                    'control': 'Group Gamma (Simple Feedback)'
                };
                
                if (assignmentMessage) {
                    assignmentMessage.textContent = `You have been assigned to: ${groupNames[assignment.treatment_group] || assignment.treatment_group}`;
                }
                if (assignmentInfo) assignmentInfo.classList.remove('d-none');
                
                // Hide loading
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                
                // Wait a moment, then redirect with student ID in URL for study site
                setTimeout(() => {
                    const redirectUrl = `${STUDY_GROUP_URLS[assignment.treatment_group]}?student_id=${encodeURIComponent(assignment.student_id)}&anonymous_id=${encodeURIComponent(assignment.anonymous_id)}`;
                    window.location.href = redirectUrl;
                }, 2000);
                
            } catch (error) {
                console.error('Error in assignment:', error);
                showAlert('An error occurred. Please try again.', 'danger');
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing INFER Assignment Website...');
    
    // Initialize Supabase
    supabase = initSupabase();
    
    // Check if returning user (skip consent if already assigned)
    const isReturning = await checkReturningUser();
    if (isReturning) {
        return; // Will redirect, so don't setup forms
    }
    
    // Setup event listeners
    setupConsentForm();
    setupAssignmentForm();
    
    console.log('✅ Assignment website initialized');
});
