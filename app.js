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
        redirecting: "Redirecting to your study site..."
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
        redirecting: "Weiterleitung zu Ihrer Studienseite..."
    }
};

// Initialize Supabase
function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
            .select('treatment_group');
        
        if (error) {
            console.error('Error getting group distribution:', error);
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
        const { data, error } = await supabaseClient
            .from('student_assignments')
            .select('*')
            .eq('student_id', normalizedId)  // Assignment based ONLY on student_id
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
    
    // Wait a moment, then redirect
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 2000);
    
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
        
        // Check for existing assignment when both fields are filled
        const checkForExistingAssignment = async () => {
            const studentId = studentIdInput?.value.trim();
            const anonymousId = anonymousIdInput?.value.trim();
            
            if (studentId && anonymousId && supabaseClient) {
                const normalizedId = studentId.toUpperCase();
                // Check localStorage first (fast)
                const stored = getStoredAssignment(normalizedId);
                if (stored && stored.treatment_group) {
                    // Verify in database
                    const dbAssignment = await checkExistingAssignment(normalizedId);
                    if (dbAssignment) {
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
                }
            }
            return null;
        };
        
        // Check when both fields are filled
        if (studentIdInput) {
            studentIdInput.addEventListener('blur', checkForExistingAssignment);
        }
        if (anonymousIdInput) {
            anonymousIdInput.addEventListener('blur', checkForExistingAssignment);
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
                // Get or create assignment
                const assignment = await getOrCreateAssignment(studentId, anonymousId);
                
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
    containers.forEach(container => {
        container.innerHTML = `
            <div class="btn-group" role="group" style="display: flex; justify-content: center;">
                <button type="button" class="btn ${currentLanguage === 'en' ? 'btn-primary' : 'btn-outline-primary'}" id="lang-switch-en">English</button>
                <button type="button" class="btn ${currentLanguage === 'de' ? 'btn-primary' : 'btn-outline-primary'}" id="lang-switch-de">Deutsch</button>
            </div>
        `;
    });
    
    // Add event listeners
    document.getElementById('lang-switch-en')?.addEventListener('click', () => switchLanguage('en'));
    document.getElementById('lang-switch-de')?.addEventListener('click', () => switchLanguage('de'));
}

function switchLanguage(lang) {
    currentLanguage = lang;
    renderLanguageSwitchers();
    applyTranslations();
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
