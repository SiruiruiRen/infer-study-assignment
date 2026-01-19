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

let supabaseClient = null;
let currentLanguage = 'de'; // Default to German

// Language translations
const translations = {
    en: {
        title: "INFER",
        subtitle: "An intelligent feedback system for observing classroom videos",
        welcome_to_infer_study: "Welcome to INFER Study",
        welcome_message: "Thank you for participating in this study on AI-supported teaching reflection. The site is open from February 1 to March 31. We recommend that you complete one video each week, so that you have enough time for spaced practice.",
        browser_recommendation: "For the best experience, we recommend using <strong>Google Chrome</strong>.",
        data_protection_header: "Data Protection Information",
        data_protection_intro: "Please read the data protection information document below.",
        open_data_protection_doc: "Open Data Protection Document",
        data_protection_checkbox: "I have read and understood the data protection information document.",
        data_consent_header: "Consent for Scientific Use",
        data_consent_intro: "Please read the consent form below and indicate whether you consent to the use of your anonymized data for scientific purposes.",
        open_consent_form: "Open Consent Form",
        data_consent_agree: "I agree to the use of my anonymized data for scientific purposes.",
        data_consent_disagree: "I do not agree to the use of my anonymized data for scientific purposes.",
        consent_disagreement_message: "You can still participate in the experiment. However, only data from participants who gave consent will be used for scientific purposes.",
        continue_button: "Continue",
        study_assignment: "Study Assignment",
        enter_your_information: "Enter Your Information",
        student_id_label: "Student ID:",
        student_id_placeholder: "Enter your student ID",
        participant_code_label: "Anonymous ID (Participant Code):",
        code_placeholder: "e.g., ER04LF09",
        anonymous_id_help: "Generate from: First letter of mother's first name + first letter of mother's last name + birth day (2 digits) + first letter of father's first name + first letter of father's last name + birth month (2 digits). <br>Example: Elke-Hannelore Müller, Wolf-Rüdiger Müller, born 09.11.1987 → ER04LF09",
        loading: "Loading...",
        assigning_group: "Assigning you to a study group...",
        continue_to_study: "Continue to Study",
        already_assigned: "You are already registered. Click \"Continue to Study\" to proceed.",
        assigned_to: "Redirecting to your study site...",
        redirecting: "Redirecting to your study site...",
        previous_anonymous_id_found: "We found a previous anonymous ID for this student ID:",
        anonymous_id_mismatch_warning: "The anonymous ID you entered doesn't match the one we have on record. We'll update it with your new entry.",
        use_previous_id: "Use Previous ID",
        keep_new_id: "Keep New ID"
    },
    de: {
        title: "INFER",
        subtitle: "Ein intelligentes Feedback-System zur Beobachtung von Unterricht",
        welcome_to_infer_study: "Willkommen zur INFER-Studie",
        welcome_message: "Vielen Dank für Ihre Teilnahme an dieser Studie zur KI-gestützten Unterrichtsreflexion. Die Website ist vom 1. Februar bis 31. März geöffnet. Wir empfehlen, dass Sie ein Video pro Woche abschließen, damit Sie genügend Zeit für verteiltes Üben haben.",
        browser_recommendation: "Für die beste Erfahrung empfehlen wir die Verwendung von <strong>Google Chrome</strong>.",
        data_protection_header: "Datenschutzhinweise",
        data_protection_intro: "Bitte lesen Sie das unten stehende Datenschutzdokument.",
        open_data_protection_doc: "Datenschutzdokument öffnen",
        data_protection_checkbox: "Ich habe die Datenschutzhinweise gelesen und verstanden.",
        data_consent_header: "Einverständniserklärung für wissenschaftliche Nutzung",
        data_consent_intro: "Bitte lesen Sie das unten stehende Einverständnisformular und geben Sie an, ob Sie der Verwendung Ihrer anonymisierten Daten für wissenschaftliche Zwecke zustimmen.",
        open_consent_form: "Einverständnisformular öffnen",
        data_consent_agree: "Ich stimme der Verwendung meiner anonymisierten Daten für wissenschaftliche Zwecke zu.",
        data_consent_disagree: "Ich stimme der Verwendung meiner anonymisierten Daten für wissenschaftliche Zwecke nicht zu.",
        consent_disagreement_message: "Sie können weiterhin am Experiment teilnehmen. Allerdings werden nur Daten von Teilnehmern verwendet, die ihre Einwilligung gegeben haben.",
        continue_button: "Weiter",
        study_assignment: "Studienzuweisung",
        enter_your_information: "Geben Sie Ihre Informationen ein",
        student_id_label: "Studenten-ID:",
        student_id_placeholder: "Geben Sie Ihre Studenten-ID ein",
        participant_code_label: "Anonyme ID (Teilnehmer-Code):",
        code_placeholder: "z.B. ER04LF09",
        anonymous_id_help: "Erstellen aus: Erster Buchstabe des Vornamens der Mutter + erster Buchstabe des Nachnamens der Mutter + Geburtstag (2 Ziffern) + erster Buchstabe des Vornamens des Vaters + erster Buchstabe des Nachnamens des Vaters + Geburtsmonat (2 Ziffern). <br>Beispiel: Elke-Hannelore Müller, Wolf-Rüdiger Müller, geboren 09.11.1987 → ER04LF09",
        loading: "Laden...",
        assigning_group: "Sie werden einer Studiengruppe zugewiesen...",
        continue_to_study: "Zur Studie fortfahren",
        already_assigned: "Sie sind bereits registriert. Klicken Sie auf \"Zur Studie fortfahren\", um fortzufahren.",
        assigned_to: "Weiterleitung zu Ihrer Studienseite...",
        redirecting: "Weiterleitung zu Ihrer Studienseite...",
        previous_anonymous_id_found: "Wir haben eine vorherige anonyme ID für diese Studenten-ID gefunden:",
        anonymous_id_mismatch_warning: "Die eingegebene anonyme ID stimmt nicht mit der in unserer Datenbank überein. Wir aktualisieren sie mit Ihrem neuen Eintrag.",
        use_previous_id: "Vorherige ID verwenden",
        keep_new_id: "Neue ID behalten"
    }
};

// Initialize Supabase
function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            // Create Supabase client with proper configuration
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: {
                    persistSession: false  // Don't persist auth session for assignment site
                },
                db: {
                    schema: 'public'
                },
                global: {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            });
            console.log('✅ Supabase initialized');
            return supabaseClient;
        } else {
            console.error('❌ Supabase library not loaded');
            return null;
        }
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

// Balanced assignment: assign to group with fewest members
async function randomAssignGroup() {
    if (!supabaseClient) {
        // Fallback to random if no database connection
        const groups = ['treatment_1', 'treatment_2', 'control'];
        const randomIndex = Math.floor(Math.random() * groups.length);
        return groups[randomIndex];
    }
    
    try {
        // Get current distribution of groups
        const { data, error } = await supabaseClient
            .from('student_assignments')
            .select('treatment_group', { count: 'exact' });  // Add count option
        
        if (error) {
            console.error('Error getting group distribution:', error);
            // Check if it's a 406 error - RLS policy issue
            if (error.status === 406 || error.code === 'PGRST301' || error.message?.includes('406')) {
                console.error('406 Not Acceptable - RLS policy may be blocking access. Using random assignment.');
            }
            // Fallback to random
            const groups = ['treatment_1', 'treatment_2', 'control'];
            const randomIndex = Math.floor(Math.random() * groups.length);
            return groups[randomIndex];
        }
        
        // Count students in each group
        const groupCounts = {
            'treatment_1': 0,
            'treatment_2': 0,
            'control': 0
        };
        
        if (data) {
            data.forEach(assignment => {
                if (assignment.treatment_group && groupCounts.hasOwnProperty(assignment.treatment_group)) {
                    groupCounts[assignment.treatment_group]++;
                }
            });
        }
        
        // Find group(s) with minimum count
        const minCount = Math.min(
            groupCounts['treatment_1'],
            groupCounts['treatment_2'],
            groupCounts['control']
        );
        
        const groupsWithMinCount = [];
        if (groupCounts['treatment_1'] === minCount) groupsWithMinCount.push('treatment_1');
        if (groupCounts['treatment_2'] === minCount) groupsWithMinCount.push('treatment_2');
        if (groupCounts['control'] === minCount) groupsWithMinCount.push('control');
        
        // If multiple groups have the same minimum count, randomly choose one
        const randomIndex = Math.floor(Math.random() * groupsWithMinCount.length);
        const selectedGroup = groupsWithMinCount[randomIndex];
        
        console.log('Group distribution:', groupCounts);
        console.log('Assigning to:', selectedGroup, '(min count:', minCount + ')');
        
        return selectedGroup;
    } catch (error) {
        console.error('Error in balanced assignment:', error);
        // Fallback to random
        const groups = ['treatment_1', 'treatment_2', 'control'];
        const randomIndex = Math.floor(Math.random() * groups.length);
        return groups[randomIndex];
    }
}

// Check if student is already assigned (case-insensitive)
// IMPORTANT: Assignment is based ONLY on student_id, NOT anonymous_id
// This ensures the same student always gets the same group, even if they change their anonymous ID
async function checkExistingAssignment(studentId) {
    if (!supabaseClient) return null;
    
    // Normalize student ID to uppercase for consistent matching
    const normalizedId = studentId.trim().toUpperCase();
    
    try {
        // Query with exact match (student_id is stored in uppercase)
        // NOTE: We only query by student_id, NOT anonymous_id
        // Use maybeSingle() instead of single() to handle empty results gracefully
        const { data, error } = await supabaseClient
            .from('student_assignments')
            .select('*', { count: 'exact' })  // Add count option for better error handling
            .eq('student_id', normalizedId)  // Assignment based ONLY on student_id
            .maybeSingle();  // Use maybeSingle() to avoid error when no rows found
        
        if (error) {
            // Check if it's a 406 error (Not Acceptable) - might be RLS policy issue
            if (error.status === 406 || error.code === 'PGRST301' || error.message?.includes('406')) {
                console.error('406 Not Acceptable error - possible RLS policy issue:', error);
                // Throw error so caller can handle it
                throw new Error('Database access denied. Please check RLS policies.');
            }
            // PGRST116 = no rows returned (this is OK, means student not assigned yet)
            if (error.code !== 'PGRST116') {
                console.error('Error checking assignment:', error);
                throw error;  // Re-throw to let caller handle
            }
            return null;  // No rows found
        }
        
        return data;  // Returns null if not found, or the assignment object if found
    } catch (error) {
        console.error('Error in checkExistingAssignment:', error);
        throw error;  // Re-throw to let caller know query failed
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
    if (!supabaseClient) {
        showAlert('Database connection error. Please refresh the page.', 'danger');
        return null;
    }
    
    // Normalize student ID to uppercase for consistent storage and matching
    const normalizedId = studentId.trim().toUpperCase();
    const normalizedAnonymousId = anonymousId.trim().toUpperCase();
    
    // First check localStorage (fast, for returning users)
    const stored = getStoredAssignment(normalizedId);
    if (stored && stored.treatment_group) {
        // Found stored assignment (don't log to avoid exposing group assignment)
        // Try to verify it still exists in database, but don't fail if query fails
        try {
            const dbAssignment = await checkExistingAssignment(normalizedId);
            if (dbAssignment) {
                // Database record exists and matches - use it
                return dbAssignment;
            } else {
                // Database query succeeded but no record found - this shouldn't happen
                // But if localStorage has a record, trust it (might be from another session)
                // localStorage has assignment but database query returned no record. Using localStorage assignment.
                // Still try to check database one more time below
            }
        } catch (error) {
            // Database query failed (e.g., 406 error) - trust localStorage if it exists
            // Database query failed, but localStorage has assignment. Using localStorage assignment.
            // Return stored assignment to prevent creating duplicate
            return stored;
        }
    }
    
    // Check database for existing assignment (case-insensitive)
    let existing = null;
    try {
        existing = await checkExistingAssignment(normalizedId);
    } catch (error) {
        console.error('Error checking existing assignment:', error);
        // If we have localStorage assignment, use it even if database query fails
        // This prevents creating duplicate assignments when database is temporarily unavailable
        if (stored && stored.treatment_group) {
                // Database query failed, but localStorage has assignment. Using localStorage assignment to prevent duplicate.
            // Return stored assignment immediately - don't try to create new one
            return stored;
        }
        // If no localStorage and database fails, we can't proceed safely
        console.error('No localStorage assignment and database query failed. Cannot proceed safely.');
        throw new Error('Unable to verify assignment. Database may be temporarily unavailable.');
    }
    
    if (existing) {
        // Found existing assignment in database (don't log to avoid exposing group assignment)
        
        // If anonymous_id changed, update it in the database (assignment stays the same)
        if (existing.anonymous_id !== normalizedAnonymousId) {
            console.log(`Anonymous ID changed from ${existing.anonymous_id} to ${normalizedAnonymousId}, updating...`);
            try {
                const { data: updated, error: updateError } = await supabaseClient
                    .from('student_assignments')
                    .update({ anonymous_id: normalizedAnonymousId })
                    .eq('student_id', normalizedId)
                    .select()
                    .single();
                
                if (updateError) {
                    console.error('Error updating anonymous_id:', updateError);
                } else {
                    console.log('Updated anonymous_id in database:', updated);
                    existing.anonymous_id = normalizedAnonymousId; // Update local object
                }
            } catch (error) {
                console.error('Error updating anonymous_id:', error);
            }
        }
        
        // Store in localStorage for faster future access
        storeAssignment(normalizedId, existing);
        return existing;
    }
    
    // Only create new assignment if we don't have one in localStorage
    // This prevents creating duplicate assignments when database query fails but localStorage has record
    if (stored && stored.treatment_group) {
                // WARNING: localStorage has assignment but database query returned no record. Using localStorage assignment to prevent duplicate.
        return stored;
    }
    
    // Create new assignment with balanced group assignment
    // NOTE: Assignment is based ONLY on student_id (unique constraint)
    // anonymous_id is stored for reference but NOT used for assignment matching
    const treatmentGroup = await randomAssignGroup();
    
    try {
        const { data, error } = await supabaseClient
            .from('student_assignments')
            .insert([{
                student_id: normalizedId,  // PRIMARY KEY for assignment - determines group
                anonymous_id: normalizedAnonymousId,  // Stored but NOT used for assignment matching
                treatment_group: treatmentGroup
            }])
            .select()
            .single();
        
        if (error) {
            // If error is due to duplicate (race condition), try to fetch existing
            if (error.code === '23505') {  // Unique violation
                console.log('Duplicate detected, fetching existing assignment...');
                try {
                    const existing = await checkExistingAssignment(normalizedId);
                    if (existing) {
                        storeAssignment(normalizedId, existing);
                        return existing;
                    }
                } catch (fetchError) {
                    console.error('Error fetching existing assignment after duplicate error:', fetchError);
                    // If fetch also fails, check localStorage
                    if (stored && stored.treatment_group) {
                        // Using localStorage assignment after duplicate error
                        return stored;
                    }
                }
            }
            console.error('Error creating assignment:', error);
            // If we have localStorage, use it as fallback
            if (stored && stored.treatment_group) {
                // Using localStorage assignment due to insert error
                return stored;
            }
            throw error;  // Re-throw if no fallback available
        }
        
        // Created new assignment (don't log to avoid exposing group assignment)
        // Store in localStorage for faster future access
        storeAssignment(normalizedId, data);
        return data;
    } catch (error) {
        console.error('Error in getOrCreateAssignment:', error);
        // Last resort: if we have localStorage assignment, use it
        if (stored && stored.treatment_group) {
            // Using localStorage assignment as last resort due to error
            return stored;
        }
        throw error;  // Re-throw if no fallback available
    }
}

// Update consent choice in database
async function updateConsentChoice(studentId, consentChoice) {
    if (!supabaseClient) return;
    
    try {
        const normalizedId = studentId.trim().toUpperCase();
        const { error } = await supabaseClient
            .from('student_assignments')
            .update({ consent_choice: consentChoice })
            .eq('student_id', normalizedId);
        
        if (error) {
            console.error('Error updating consent choice:', error);
        } else {
            console.log('Consent choice updated:', consentChoice);
        }
    } catch (error) {
        console.error('Error in updateConsentChoice:', error);
    }
}

// Redirect to appropriate study site
function redirectToStudySite(treatmentGroup, studentId = null, anonymousId = null) {
    const url = STUDY_GROUP_URLS[treatmentGroup];
    if (!url) {
        showAlert('Invalid study group. Please contact the administrator.', 'danger');
        return;
    }
    
    // Add student ID and anonymous ID to URL if provided
    let redirectUrl = url;
    if (studentId && anonymousId) {
        redirectUrl = `${url}?student_id=${encodeURIComponent(studentId)}&anonymous_id=${encodeURIComponent(anonymousId)}`;
    }
    
    // Wait a moment to show the message, then redirect with URL parameters
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 2000);
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
        continueBtn.addEventListener('click', async () => {
            // Get consent choice
            const consentChoice = consentAgree?.checked ? 'agree' : (consentDisagree?.checked ? 'disagree' : null);
            
            if (!consentChoice) {
                showAlert('Please select a consent option.', 'warning');
                return;
            }
            
            // Get student ID from ID page (stored in sessionStorage or get from assignment)
            const studentIdInput = document.getElementById('student-id-input');
            let studentId = studentIdInput?.value.trim();
            let anonymousId = document.getElementById('anonymous-id-input')?.value.trim();
            
            // If not in inputs, try to get from sessionStorage (from ID page)
            if (!studentId) {
                const storedAssignment = sessionStorage.getItem('pending_assignment');
                if (storedAssignment) {
                    const assignment = JSON.parse(storedAssignment);
                    studentId = assignment.student_id;
                    anonymousId = assignment.anonymous_id;
                }
            }
            
            // Store consent choice
            if (studentId && consentChoice && supabaseClient) {
                await updateConsentChoice(studentId.toUpperCase(), consentChoice);
            }
            
            // Redirect to study site
            if (studentId && anonymousId) {
                const assignment = await getOrCreateAssignment(studentId, anonymousId);
                if (assignment) {
                    redirectToStudySite(assignment.treatment_group, assignment.student_id, assignment.anonymous_id);
                }
            } else {
                showAlert('Please go back and enter your student ID first.', 'warning');
            }
        });
    }
}

// Check if user is returning (has assignment stored)
async function checkReturningUser() {
    // Check URL parameters first (if redirected from assignment)
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdParam = urlParams.get('student_id');
    const anonymousIdParam = urlParams.get('anonymous_id');
    
    if (studentIdParam) {
        const normalizedId = studentIdParam.trim().toUpperCase();
        const stored = getStoredAssignment(normalizedId);
        if (stored && stored.treatment_group) {
            // Verify in database
            const dbAssignment = await checkExistingAssignment(normalizedId);
            if (dbAssignment) {
                // Returning user detected, redirecting to correct site
                // Pass both student_id and anonymous_id to redirect function
                redirectToStudySite(
                    dbAssignment.treatment_group, 
                    dbAssignment.student_id || normalizedId,
                    dbAssignment.anonymous_id || anonymousIdParam
                );
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
        
        // Check for existing assignment and hint for anonymous_id when student_id is entered
        const checkForStudentId = async () => {
            const studentId = studentIdInput?.value.trim();
            
            if (studentId && supabaseClient) {
                const normalizedId = studentId.toUpperCase();
                let dbAssignment = null;
                try {
                    dbAssignment = await checkExistingAssignment(normalizedId);
                } catch (error) {
                    console.warn('Error checking assignment for hint:', error);
                    // If database query fails, check localStorage
                    const stored = getStoredAssignment(normalizedId);
                    if (stored && stored.anonymous_id) {
                        dbAssignment = stored;
                    }
                }
                
                if (dbAssignment && dbAssignment.anonymous_id) {
                    // Show hint for previous anonymous_id
                    const hintDiv = document.getElementById('anonymous-id-hint');
                    const hintMessage = document.getElementById('anonymous-id-hint-message');
                    const usePreviousBtn = document.getElementById('use-previous-id-btn');
                    const t = translations[currentLanguage];
                    
                    if (hintDiv && hintMessage) {
                        hintMessage.textContent = `${t.previous_anonymous_id_found} ${dbAssignment.anonymous_id}`;
                        hintDiv.classList.remove('d-none');
                        
                        // Show button to use previous ID
                        if (usePreviousBtn) {
                            usePreviousBtn.style.display = 'inline-block';
                            usePreviousBtn.onclick = () => {
                                if (anonymousIdInput) {
                                    anonymousIdInput.value = dbAssignment.anonymous_id;
                                    updateSubmitButton();
                                    hintDiv.classList.add('d-none');
                                }
                            };
                        }
                    }
                } else {
                    // Hide hint if no previous record
                    const hintDiv = document.getElementById('anonymous-id-hint');
                    if (hintDiv) hintDiv.classList.add('d-none');
                }
            } else {
                // Hide hint if no student_id
                const hintDiv = document.getElementById('anonymous-id-hint');
                if (hintDiv) hintDiv.classList.add('d-none');
            }
        };
        
        // Check for existing assignment when both fields are filled
        const checkForExistingAssignment = async () => {
            const studentId = studentIdInput?.value.trim();
            const anonymousId = anonymousIdInput?.value.trim();
            
            if (studentId && anonymousId && supabaseClient) {
                const normalizedId = studentId.toUpperCase();
                const normalizedAnonymousId = anonymousId.toUpperCase();
                
                // Check localStorage first (fast)
                const stored = getStoredAssignment(normalizedId);
                if (stored && stored.treatment_group) {
                    // Try to verify in database, but don't fail if query fails
                    let dbAssignment = null;
                    try {
                        dbAssignment = await checkExistingAssignment(normalizedId);
                    } catch (error) {
                        console.warn('Database query failed, using localStorage assignment:', error);
                        // If database query fails but localStorage has assignment, use it
                        dbAssignment = stored;
                    }
                    
                    if (dbAssignment) {
                        // Check if anonymous_id matches
                        if (dbAssignment.anonymous_id && 
                            dbAssignment.anonymous_id.toUpperCase() !== normalizedAnonymousId) {
                            // Show warning about mismatch
                            const warningDiv = document.getElementById('anonymous-id-warning');
                            const warningMessage = document.getElementById('anonymous-id-warning-message');
                            const t = translations[currentLanguage];
                            
                            if (warningDiv && warningMessage) {
                                warningMessage.textContent = t.anonymous_id_mismatch_warning;
                                warningDiv.classList.remove('d-none');
                            }
                        } else {
                            // Hide warning if they match
                            const warningDiv = document.getElementById('anonymous-id-warning');
                            if (warningDiv) warningDiv.classList.add('d-none');
                        }
                        
                        // Auto-redirect to correct site if already assigned (don't show group info)
                        if (dbAssignment.treatment_group) {
                            redirectToStudySite(
                                dbAssignment.treatment_group,
                                dbAssignment.student_id || normalizedId,
                                dbAssignment.anonymous_id || normalizedAnonymousId
                            );
                            return dbAssignment;
                        }
                        
                        // Show message that they're already assigned (without revealing group)
                        if (assignmentMessage) {
                            const t = translations[currentLanguage];
                            assignmentMessage.textContent = t.already_assigned;
                        }
                        if (assignmentInfo) assignmentInfo.classList.remove('d-none');
                        // Enable submit button
                        if (submitBtn) submitBtn.disabled = false;
                        return dbAssignment;
                    }
                } else {
                    // Check database directly
                    let dbAssignment = null;
                    try {
                        dbAssignment = await checkExistingAssignment(normalizedId);
                    } catch (error) {
                        console.warn('Database query failed:', error);
                        // If localStorage has assignment, use it even if database fails
                        if (stored && stored.treatment_group) {
                            dbAssignment = stored;
                        }
                    }
                    
                    if (dbAssignment) {
                        // Check if anonymous_id matches
                        if (dbAssignment.anonymous_id && 
                            dbAssignment.anonymous_id.toUpperCase() !== normalizedAnonymousId) {
                            // Show warning about mismatch
                            const warningDiv = document.getElementById('anonymous-id-warning');
                            const warningMessage = document.getElementById('anonymous-id-warning-message');
                            const t = translations[currentLanguage];
                            
                            if (warningDiv && warningMessage) {
                                warningMessage.textContent = t.anonymous_id_mismatch_warning;
                                warningDiv.classList.remove('d-none');
                            }
                        }
                        
                        // Auto-redirect to correct site if already assigned (don't show group info)
                        if (dbAssignment.treatment_group) {
                            redirectToStudySite(
                                dbAssignment.treatment_group,
                                dbAssignment.student_id || normalizedId,
                                dbAssignment.anonymous_id || normalizedAnonymousId
                            );
                            return dbAssignment;
                        }
                        
                        // Show message that they're already assigned
                        if (assignmentMessage) {
                            const t = translations[currentLanguage];
                            assignmentMessage.textContent = t.already_assigned;
                        }
                        if (assignmentInfo) assignmentInfo.classList.remove('d-none');
                        if (submitBtn) submitBtn.disabled = false;
                        return dbAssignment;
                    }
                }
            }
            
            // Hide warning if no match found
            const warningDiv = document.getElementById('anonymous-id-warning');
            if (warningDiv) warningDiv.classList.add('d-none');
            return null;
        };
        
        // Check for student_id hint when student_id field loses focus
        studentIdInput.addEventListener('blur', checkForStudentId);
        
        // Check when both fields are filled
        if (anonymousIdInput) {
            anonymousIdInput.addEventListener('blur', checkForExistingAssignment);
            anonymousIdInput.addEventListener('input', () => {
                // Hide warning when user starts typing
                const warningDiv = document.getElementById('anonymous-id-warning');
                if (warningDiv) warningDiv.classList.add('d-none');
            });
        }
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
                // Check localStorage first - if exists, use it even if database query fails
                const normalizedId = studentId.toUpperCase();
                const stored = getStoredAssignment(normalizedId);
                
                // Get or create assignment
                let assignment = null;
                try {
                    assignment = await getOrCreateAssignment(studentId, anonymousId);
                } catch (error) {
                    console.error('Error in getOrCreateAssignment:', error);
                    // If database operation failed but we have localStorage assignment, use it
                    if (stored && stored.treatment_group) {
                        // Database operation failed, using localStorage assignment
                        assignment = stored;
                        showAlert('Using your previous assignment. If this is incorrect, please contact support.', 'info');
                    } else {
                        showAlert('Failed to create assignment. Please refresh the page and try again.', 'danger');
                        if (loadingSpinner) loadingSpinner.classList.add('d-none');
                        if (submitBtn) submitBtn.disabled = false;
                        return;
                    }
                }
                
                if (!assignment) {
                    showAlert('Failed to create assignment. Please try again.', 'danger');
                    if (loadingSpinner) loadingSpinner.classList.add('d-none');
                    if (submitBtn) submitBtn.disabled = false;
                    return;
                }
                
                // Show assignment info (without revealing group)
                const t = translations[currentLanguage];
                const isReturning = getStoredAssignment(studentId.toUpperCase()) !== null;
                const message = isReturning 
                    ? t.already_assigned + ' ' + t.redirecting
                    : t.assigned_to;
                
                if (assignmentMessage) {
                    assignmentMessage.textContent = message;
                }
                if (assignmentInfo) assignmentInfo.classList.remove('d-none');
                
                // Hide loading
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                
                // After assignment, show consent page (page-id-assignment contains consent forms)
                showPage('page-id-assignment');
                
                // Load existing consent choice if available
                if (assignment.consent_choice) {
                    const consentAgree = document.getElementById('data-consent-agree');
                    const consentDisagree = document.getElementById('data-consent-disagree');
                    const dataProtectionCheckbox = document.getElementById('data-protection-read');
                    
                    if (assignment.consent_choice === 'agree' && consentAgree) {
                        consentAgree.checked = true;
                    } else if (assignment.consent_choice === 'disagree' && consentDisagree) {
                        consentDisagree.checked = true;
                    }
                    
                    if (dataProtectionCheckbox) {
                        dataProtectionCheckbox.checked = true;
                    }
                    
                    // Update continue button state
                    const continueBtn = document.getElementById('continue-to-id');
                    if (continueBtn) continueBtn.disabled = false;
                }
                
            } catch (error) {
                console.error('Error in assignment:', error);
                showAlert('An error occurred. Please try again.', 'danger');
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

// Language switching functions
function renderLanguageSwitchers() {
    const containers = document.querySelectorAll('.language-switcher-container');
    containers.forEach((container, index) => {
        // Use unique IDs for each container to avoid conflicts
        const enId = `lang-switch-en-${index}`;
        const deId = `lang-switch-de-${index}`;
        
        container.innerHTML = `
            <div class="btn-group" role="group" style="display: flex; justify-content: center;">
                <button type="button" class="btn ${currentLanguage === 'en' ? 'btn-primary' : 'btn-outline-primary'}" id="${enId}">English</button>
                <button type="button" class="btn ${currentLanguage === 'de' ? 'btn-primary' : 'btn-outline-primary'}" id="${deId}">Deutsch</button>
            </div>
        `;
        
        // Add event listeners to each button immediately after creating them
        const enButton = document.getElementById(enId);
        const deButton = document.getElementById(deId);
        if (enButton) {
            enButton.addEventListener('click', () => switchLanguage('en'));
        }
        if (deButton) {
            deButton.addEventListener('click', () => switchLanguage('de'));
        }
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    renderLanguageSwitchers();
    applyTranslations();
    
    // Update hint message if it's visible
    const hintDiv = document.getElementById('anonymous-id-hint');
    const hintMessage = document.getElementById('anonymous-id-hint-message');
    if (hintDiv && hintMessage && !hintDiv.classList.contains('d-none')) {
        // Re-check student ID to update hint message with new language
        const studentIdInput = document.getElementById('student-id-input');
        if (studentIdInput && studentIdInput.value.trim()) {
            // Trigger the check again to update the hint message
            setTimeout(() => {
                const checkForStudentId = async () => {
                    const studentId = studentIdInput.value.trim();
                    if (studentId && supabaseClient) {
                        const normalizedId = studentId.toUpperCase();
                        let dbAssignment = null;
                        try {
                            dbAssignment = await checkExistingAssignment(normalizedId);
                        } catch (error) {
                            console.warn('Error checking assignment for hint:', error);
                            const stored = getStoredAssignment(normalizedId);
                            if (stored && stored.anonymous_id) {
                                dbAssignment = stored;
                            }
                        }
                        
                        if (dbAssignment && dbAssignment.anonymous_id) {
                            const t = translations[currentLanguage];
                            hintMessage.textContent = `${t.previous_anonymous_id_found} ${dbAssignment.anonymous_id}`;
                        }
                    }
                };
                checkForStudentId();
            }, 100);
        }
    }
}

function applyTranslations() {
    const t = translations[currentLanguage];
    if (!t) return;
    
    // Update all elements with data-lang-key-placeholder attribute (for placeholders)
    document.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-key-placeholder');
        if (t[key]) {
            element.placeholder = t[key];
        }
    });
    
    // Update all elements with data-lang-key attribute
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (t[key]) {
            // For buttons with spans inside, update the span
            if (element.tagName === 'BUTTON' && element.querySelector('span[data-lang-key]')) {
                const span = element.querySelector('span[data-lang-key]');
                if (span) {
                    if (t[key].includes('<') && t[key].includes('>')) {
                        span.innerHTML = t[key];
                    } else {
                        span.textContent = t[key];
                    }
                }
            }
            // For links with spans inside
            else if (element.tagName === 'A' && element.querySelector('span[data-lang-key]')) {
                const span = element.querySelector('span[data-lang-key]');
                if (span) {
                    if (t[key].includes('<') && t[key].includes('>')) {
                        span.innerHTML = t[key];
                    } else {
                        span.textContent = t[key];
                    }
                }
            }
            // For span elements directly - use innerHTML to preserve HTML tags
            else if (element.tagName === 'SPAN' || element.tagName === 'SMALL') {
                if (t[key].includes('<') && t[key].includes('>')) {
                    element.innerHTML = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
            // For input elements, check if they should have placeholder updated
            else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'text' || element.type === 'textarea' || element.tagName === 'TEXTAREA') {
                    if (key.includes('placeholder') || key.includes('reflection') || key.includes('paste')) {
                        element.placeholder = t[key];
                    } else {
                        element.value = t[key];
                    }
                } else {
                    element.value = t[key];
                }
            }
            // For other elements, update text content directly
            else {
                // Use innerHTML for elements that might contain HTML
                if (t[key].includes('<') && t[key].includes('>')) {
                    element.innerHTML = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
        }
    });
}

// Note: getGroupName function removed - we no longer reveal group information to students

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing INFER Assignment Website...');
    
    // Initialize Supabase
    supabaseClient = initSupabase();
    
    // Show ID page first (page-welcome)
    showPage('page-welcome');
    
    // Check if returning user (skip consent if already assigned)
    const isReturning = await checkReturningUser();
    if (isReturning) {
        return; // Will redirect, so don't setup forms
    }
    
    // Setup event listeners (ID page first, then consent)
    setupAssignmentForm();
    setupConsentForm();
    
    // Initialize language system
    renderLanguageSwitchers();
    applyTranslations();
    
    console.log('✅ Assignment website initialized');
});
