// Dynamic Drag and Drop Activity App
class DynamicDragDropActivity {
    constructor() {
        this.currentActivity = null;
        this.activities = [];
        this.dropZones = [];
        this.currentMode = 'selection'; // Start with activity selection
        this.selectedZone = null;
        this.correctPlacements = 0;
        this.placedLabels = new Set();
        this.draggedElement = null;
        
        // New properties for student tracking
        this.studentName = '';
        this.activityStartTime = null;
        this.activityEndTime = null;
        this.timerInterval = null;
        this.isActivityActive = false;
        
        // Password protection properties
        this.teacherPassword = '0000';
        this.isTeacherModeUnlocked = false;
        
        // Score submission configuration for Google Form
        this.scoreSubmissionConfig = {
            enabled: true,
            googleFormUrl: 'https://script.google.com/macros/s/AKfycbyw0AR6itqy6CrvoOYrzyDwg1EawucJ2Oj06-i032QC_FKREzj7qE5vrHvSfdrxpsvL/exec',
            fallback: {
                showInConsole: true,
                createDownloadableReport: true,
                showAlert: false
            }
        };
        
        // Initialize score submission configuration
        this.initializeScoreSubmission();
        
        this.initializeElements();
        this.loadActivities();
        this.setupEventListeners();
    }

    initializeElements() {
        // Activity selection elements
        this.activitySelector = document.getElementById('activity-selector');
        this.loadActivityBtn = document.getElementById('load-activity-btn');
        this.studentNameInput = document.getElementById('student-name');
        
        // Teacher mode elements
        this.teacherMode = document.getElementById('teacher-mode');
        this.activityTitle = document.getElementById('activity-title');
        this.addZoneBtn = document.getElementById('add-zone-btn');
        this.clearTermsBtn = document.getElementById('clear-terms-btn');
        this.saveToFileBtn = document.getElementById('save-to-file-btn');
        this.switchToStudentBtn = document.getElementById('switch-to-student-btn');
        this.backToSelectionBtn = document.getElementById('back-to-selection-btn');
        
        // Debug: Check if elements are found
        console.log('Switch to Student button found:', this.switchToStudentBtn);
        console.log('Add Zone button found:', this.addZoneBtn);
        console.log('Clear Terms button found:', this.clearTermsBtn);
        this.activityImage = document.getElementById('activity-image');
        this.dropZonesContainer = document.getElementById('drop-zones-container');
        this.termsList = document.getElementById('terms-list');
        
        // Zone configuration elements
        this.zoneConfig = document.getElementById('zone-config');
        this.zoneTerm = document.getElementById('zone-term');
        this.zoneX = document.getElementById('zone-x');
        this.zoneY = document.getElementById('zone-y');
        this.zoneWidth = document.getElementById('zone-width');
        this.zoneHeight = document.getElementById('zone-height');
        this.saveZoneBtn = document.getElementById('save-zone-btn');
        this.cancelZoneBtn = document.getElementById('cancel-zone-btn');
        this.deleteZoneBtn = document.getElementById('delete-zone-btn');
        
        // Student mode elements
        this.studentMode = document.getElementById('student-mode');
        this.activityTitleDisplay = document.getElementById('activity-title-display');
        this.startActivityBtn = document.getElementById('start-activity-btn');
        this.backToTeacherBtn = document.getElementById('back-to-teacher-btn');
        this.activityImageDisplay = document.getElementById('activity-image'); // Use shared image
        this.activityDropZones = document.getElementById('drop-zones-container'); // Use shared drop zones
        this.labelsContainer = document.getElementById('labels-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.feedback = document.getElementById('feedback');
        this.resetBtn = document.getElementById('reset-btn');
        
        // New student tracking elements
        this.studentInfo = document.getElementById('student-info');
        this.displayStudentName = document.getElementById('display-student-name');
        this.timerDisplay = document.getElementById('timer-display');
        this.submitScoreBtn = document.getElementById('submit-score-btn');
        
        // Password modal elements
        this.passwordModal = document.getElementById('password-modal');
        this.teacherPasswordInput = document.getElementById('teacher-password');
        this.submitPasswordBtn = document.getElementById('submit-password-btn');
        this.cancelPasswordBtn = document.getElementById('cancel-password-btn');
        
        // Back to selection button for students
        this.backToSelectionStudentBtn = document.getElementById('back-to-selection-student-btn');
    }

    async loadActivities() {
        try {
            // Load activities using the ActivityLoader
            const loader = new ActivityLoader();
            this.activities = await loader.scanActivitiesFolder();
            
            this.populateActivitySelector();
            
            // Don't auto-load - let user select activity
        } catch (error) {
            console.error('Error loading activities:', error);
            this.showFeedback('Error loading activities. Please check the Activities folder.', 'error');
        }
    }

    populateActivitySelector() {
        this.activitySelector.innerHTML = '<option value="">Choose an activity...</option>';
        this.activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.name;
            option.textContent = activity.displayName;
            this.activitySelector.appendChild(option);
        });
    }

    setupEventListeners() {
        // Activity selection
        this.loadActivityBtn.addEventListener('click', () => this.loadSelectedActivity());
        
        // Teacher mode
        this.addZoneBtn.addEventListener('click', () => this.addDropZone());
        this.clearTermsBtn.addEventListener('click', () => this.clearAllTerms());
        this.saveToFileBtn.addEventListener('click', () => this.saveToFile());
        this.switchToStudentBtn.addEventListener('click', () => {
            console.log('Switch to Student button clicked!');
            this.switchToStudentMode();
        });
        this.backToSelectionBtn.addEventListener('click', () => this.showSelectionMode());
        
        // Zone configuration
        this.saveZoneBtn.addEventListener('click', () => this.saveZone());
        this.cancelZoneBtn.addEventListener('click', () => this.cancelZoneEdit());
        this.deleteZoneBtn.addEventListener('click', () => this.deleteZone());
        
        // Student mode
        this.startActivityBtn.addEventListener('click', () => this.startActivity());
        this.backToTeacherBtn.addEventListener('click', () => this.showTeacherMode());
        this.resetBtn.addEventListener('click', () => this.resetActivity());
        this.submitScoreBtn.addEventListener('click', () => this.submitScore());
        this.backToSelectionStudentBtn.addEventListener('click', () => this.backToSelectionFromStudent());
        
        // Password modal
        this.submitPasswordBtn.addEventListener('click', () => this.checkTeacherPassword());
        this.cancelPasswordBtn.addEventListener('click', () => this.hidePasswordModal());
        this.teacherPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkTeacherPassword();
            }
        });
        
        // Handle window resize to maintain zone positioning
        window.addEventListener('resize', () => {
            if (this.currentActivity && this.dropZones.length > 0) {
                // Re-validate positions and re-render zones
                setTimeout(() => {
                    this.validateZonePositions();
                    this.synchronizeZonePositions();
                    
                    if (this.currentMode === 'teacher') {
                        this.renderDropZones();
                    } else if (this.currentMode === 'student') {
                        this.createActivityDropZones();
                    }
                }, 150); // Slightly longer delay to ensure resize is complete
            }
        });
    }

    async loadSelectedActivity() {
        console.log('Load Activity button clicked');
        const selectedActivityName = this.activitySelector.value;
        console.log('Selected activity name:', selectedActivityName);
        
        if (!selectedActivityName) {
            this.showFeedback('Please select an activity first.', 'error');
            return;
        }

        // Use existing student name or validate new input
        let studentName = this.studentNameInput.value.trim();
        console.log('Student name:', studentName);
        
        if (!studentName) {
            this.showFeedback('Please enter your name before loading an activity.', 'error');
            return;
        }

        // Update student name if it changed
        if (studentName !== this.studentName) {
            this.studentName = studentName;
        }

        this.currentActivity = this.activities.find(a => a.name === selectedActivityName);
        console.log('Found activity:', this.currentActivity);
        
        if (!this.currentActivity) {
            this.showFeedback('Activity not found.', 'error');
            return;
        }

        // Load terms and setup data for the selected activity
        try {
            const loader = new ActivityLoader();
            this.currentActivity.terms = await loader.loadTermsForActivity(this.currentActivity);
            this.currentActivity.setup = await loader.loadSetupForActivity(this.currentActivity);
            console.log('Loaded activity data:', this.currentActivity);
        } catch (error) {
            console.error('Error loading activity data:', error);
            this.showFeedback('Error loading activity data.', 'error');
            return;
        }

        console.log('Loading activity image:', this.currentActivity.image);
        
        // Load activity image and show student mode
        this.activityImage.src = this.currentActivity.image;
        this.activityImage.onload = () => {
            console.log('Activity image loaded successfully');
            // Show the image section now that it's loaded
            document.getElementById('activity-image-section').style.display = 'block';
            // Load drop zones first, then show student mode
            this.loadDropZones();
            this.showStudentMode();
        };
        this.activityImage.onerror = () => {
            console.error('Error loading activity image');
            this.showFeedback('Error loading activity image.', 'error');
        };
    }

    showTeacherMode() {
        // Check if teacher mode is unlocked
        if (!this.isTeacherModeUnlocked) {
            this.showPasswordModal();
            return;
        }
        
        this.currentMode = 'teacher';
        document.getElementById('activity-selection').style.display = 'none';
        this.teacherMode.style.display = 'block';
        this.studentMode.style.display = 'none';
        
        // Show the image section for teacher mode
        document.getElementById('activity-image-section').style.display = 'block';
        
        this.activityTitle.textContent = this.currentActivity.displayName;
        this.loadTerms();
        
        // Ensure image is loaded before positioning zones
        if (this.activityImage.complete) {
            setTimeout(() => {
                this.loadDropZones();
            }, 100);
        } else {
            this.activityImage.onload = () => {
                setTimeout(() => {
                    this.loadDropZones();
                }, 100);
            };
        }
    }

    showPasswordModal() {
        this.passwordModal.style.display = 'flex';
        this.teacherPasswordInput.value = '';
        this.teacherPasswordInput.focus();
    }

    showStudentMode() {
        console.log('Showing student mode...');
        this.currentMode = 'student';
        
        // Hide other modes
        document.getElementById('activity-selection').style.display = 'none';
        this.teacherMode.style.display = 'none';
        
        // Show student mode
        this.studentMode.style.display = 'block';
        
        // Set up student mode content
        this.activityTitleDisplay.textContent = this.currentActivity.displayName;
        this.activityImageDisplay.src = this.currentActivity.image;
        
        // Display student name
        this.displayStudentName.textContent = this.studentName;
        this.studentInfo.style.display = 'flex';
        
        // Ensure image is loaded before positioning zones
        this.activityImageDisplay.onload = () => {
            // Wait a bit more to ensure the image is fully rendered
            setTimeout(() => {
                // Load drop zones first
                this.loadDropZones();
                
                console.log('Creating activity drop zones...');
                this.createActivityDropZones();
                
                console.log('Creating draggable labels...');
                this.createDraggableLabels();
                
                // Check if we have any assigned terms
                const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
                if (assignedTerms.length === 0) {
                    // No terms assigned - show message to go to teacher mode
                    this.labelsContainer.innerHTML = `
                        <h3>No Activity Setup</h3>
                        <div class="student-instructions">
                            <p>This activity hasn't been set up yet. Please switch to Teacher Mode to configure the drop zones.</p>
                            <button id="go-to-teacher-btn" class="primary-button">Go to Teacher Mode</button>
                        </div>
                    `;
                    
                    // Add event listener for the button
                    document.getElementById('go-to-teacher-btn').addEventListener('click', () => {
                        this.showTeacherMode();
                    });
                }
                
                console.log('Student mode setup complete');
            }, 100); // Small delay to ensure image is fully rendered
        };
    }

    showSelectionMode() {
        this.currentMode = 'selection';
        document.getElementById('activity-selection').style.display = 'block';
        this.teacherMode.style.display = 'none';
        this.studentMode.style.display = 'none';
        
        // Hide the image section on selection page
        document.getElementById('activity-image-section').style.display = 'none';
        
        // Clear current activity
        this.currentActivity = null;
        this.dropZones = [];
        this.selectedZone = null;
        
        // Reset activity tracking state but preserve student name
        this.activityStartTime = null;
        this.activityEndTime = null;
        this.isActivityActive = false;
        
        // Stop timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Note: We don't clear this.studentName or this.studentNameInput.value
        // so the name persists when switching activities
    }

    loadTerms() {
        this.termsList.innerHTML = '';
        this.currentActivity.terms.forEach(term => {
            const termItem = document.createElement('div');
            termItem.className = 'term-item';
            termItem.textContent = term;
            termItem.dataset.term = term;
            this.termsList.appendChild(termItem);
        });
        
        // Populate zone term selector
        this.zoneTerm.innerHTML = '<option value="">Select a term...</option>';
        this.currentActivity.terms.forEach(term => {
            const option = document.createElement('option');
            option.value = term;
            option.textContent = term;
            this.zoneTerm.appendChild(option);
        });
    }

    loadDropZones() {
        console.log('Loading drop zones for activity:', this.currentActivity.name);
        console.log('Activity setup data:', this.currentActivity.setup);
        
        // First check if there's setup data in the activity configuration
        if (this.currentActivity.setup && this.currentActivity.setup.dropZones && this.currentActivity.setup.dropZones.length > 0) {
            this.dropZones = this.currentActivity.setup.dropZones;
            console.log('Loaded drop zones from activity setup:', this.dropZones);
        } else {
            console.log('No setup data found, checking localStorage...');
            // Fall back to localStorage
            const savedZones = localStorage.getItem(`dropZones_${this.currentActivity.name}`);
            if (savedZones) {
                this.dropZones = JSON.parse(savedZones);
                console.log('Loaded drop zones from localStorage:', this.dropZones);
            } else {
                console.log('No localStorage data, creating default zones...');
                // Create empty default zones (no terms assigned yet)
                this.dropZones = this.currentActivity.terms.map((term, index) => ({
                    id: `zone-${index}`,
                    term: '', // Start with no term assigned
                    x: 20 + (index * 15),
                    y: 20 + (index * 10),
                    width: 15,
                    height: 10
                }));
                console.log('Created default drop zones:', this.dropZones);
            }
        }
        
        // Validate and correct zone positions
        this.validateZonePositions();
        
        // Ensure zones are properly synchronized between modes
        this.synchronizeZonePositions();
        
        this.renderDropZones();
    }

    validateZonePositions() {
        // Get the current image element
        const imageElement = this.currentMode === 'teacher' ? this.activityImage : this.activityImageDisplay;
        
        if (!imageElement || !imageElement.complete) {
            // If image isn't loaded yet, use basic validation
            this.dropZones.forEach(zone => {
                zone.x = Math.max(0, Math.min(100, zone.x));
                zone.y = Math.max(0, Math.min(100, zone.y));
                zone.width = Math.max(5, Math.min(50, zone.width)); // Percentage-based limits
                zone.height = Math.max(5, Math.min(50, zone.height)); // Percentage-based limits
            });
            return;
        }
        
        // Wait for the image to be fully rendered
        const imageRect = imageElement.getBoundingClientRect();
        
        // If the image rect is not properly sized yet, wait a bit more
        if (imageRect.width === 0 || imageRect.height === 0) {
            setTimeout(() => this.validateZonePositions(), 50);
            return;
        }
        
        this.dropZones.forEach(zone => {
            // Normalize legacy zones saved with pixels
            if (zone.width > 100) {
                zone.width = (zone.width / imageRect.width) * 100;
            }
            if (zone.height > 100) {
                zone.height = (zone.height / imageRect.height) * 100;
            }
            
            // Ensure x and y are within 0-100 range
            zone.x = Math.max(0, Math.min(100, zone.x));
            zone.y = Math.max(0, Math.min(100, zone.y));
            
            // Ensure reasonable zone sizes (as percentages)
            zone.width = Math.max(5, Math.min(50, zone.width));
            zone.height = Math.max(5, Math.min(50, zone.height));
            
            // Ensure zones don't extend beyond image boundaries
            if (zone.x + zone.width > 100) {
                zone.x = 100 - zone.width;
            }
            if (zone.y + zone.height > 100) {
                zone.y = 100 - zone.height;
            }
        });
    }

    synchronizeZonePositions() {
        // Ensure all zones have consistent percentage-based positioning
        this.dropZones.forEach(zone => {
            // Round positions to 2 decimal places for consistency
            zone.x = Math.round(zone.x * 100) / 100;
            zone.y = Math.round(zone.y * 100) / 100;
            zone.width = Math.round(zone.width * 100) / 100;
            zone.height = Math.round(zone.height * 100) / 100;
            
            // Ensure all values are within valid ranges
            zone.x = Math.max(0, Math.min(100, zone.x));
            zone.y = Math.max(0, Math.min(100, zone.y));
            zone.width = Math.max(5, Math.min(50, zone.width));
            zone.height = Math.max(5, Math.min(50, zone.height));
        });
        
        console.log('Synchronized zone positions:', this.dropZones);
    }

    ensureConsistentImageDimensions() {
        // CSS now handles consistent image dimensions automatically
        // Both images use .image-container img styling which ensures they're the same size
        console.log('Image dimensions are now handled by CSS');
    }

    renderDropZones() {
        this.dropZonesContainer.innerHTML = '';
        this.dropZones.forEach(zone => this.createZoneElement(zone, true));
        this.updateTermAssignments();
    }

    createZoneElement(zone, isSetup = false) {
        const zoneElement = document.createElement('div');
        zoneElement.className = `drop-zone ${isSetup ? 'setup-zone' : ''}`;
        zoneElement.id = zone.id;
        zoneElement.dataset.target = zone.term;
        
        // Ensure positioning is consistent and within bounds
        const x = Math.max(0, Math.min(100, zone.x));
        const y = Math.max(0, Math.min(100, zone.y));
        
        // Use percentage-based positioning for consistency
        zoneElement.style.left = `${x}%`;
        zoneElement.style.top = `${y}%`;
        zoneElement.style.width = `${zone.width}%`;
        zoneElement.style.height = `${zone.height}%`;
        
        // Ensure the zone is positioned relative to the image container
        zoneElement.style.position = 'absolute';
        
        if (isSetup) {
            zoneElement.addEventListener('click', () => this.selectZone(zone));
            this.makeZoneDraggable(zoneElement, zone);
        }

        // Append to the correct container based on mode
        const container = isSetup
            ? this.dropZonesContainer
            : this.activityDropZones;

        container.appendChild(zoneElement);
        return zoneElement;
    }

    makeZoneDraggable(zoneElement, zone) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        zoneElement.addEventListener('mousedown', (e) => {
            if (e.target === zoneElement) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseFloat(zoneElement.style.left);
                startTop = parseFloat(zoneElement.style.top);
                
                zoneElement.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Get the actual image element for precise positioning
            const imageElement = this.activityImage; // Always use teacher mode image for dragging
            const imageRect = imageElement.getBoundingClientRect();
            
            // Ensure we have valid dimensions
            if (imageRect.width === 0 || imageRect.height === 0) {
                return;
            }
            
            // Calculate new position as percentages relative to the actual image
            const newLeftPercent = ((startLeft * imageRect.width / 100) + deltaX) / imageRect.width * 100;
            const newTopPercent = ((startTop * imageRect.height / 100) + deltaY) / imageRect.height * 100;
            
            // Constrain to image bounds (accounting for zone size)
            const zoneWidthPercent = zone.width; // Already in percentage
            const zoneHeightPercent = zone.height; // Already in percentage
            
            const constrainedLeft = Math.max(0, Math.min(100 - zoneWidthPercent, newLeftPercent));
            const constrainedTop = Math.max(0, Math.min(100 - zoneHeightPercent, newTopPercent));
            
            zoneElement.style.left = `${constrainedLeft}%`;
            zoneElement.style.top = `${constrainedTop}%`;
            
            // Update zone data
            zone.x = constrainedLeft;
            zone.y = constrainedTop;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                zoneElement.style.cursor = 'move';
                this.saveDropZones();
            }
        });
    }

    selectZone(zone) {
        // Deselect previous zone
        if (this.selectedZone) {
            const prevElement = document.getElementById(this.selectedZone.id);
            if (prevElement) prevElement.classList.remove('selected');
        }
        
        this.selectedZone = zone;
        const zoneElement = document.getElementById(zone.id);
        if (zoneElement) zoneElement.classList.add('selected');
        
        // Populate configuration form with percentage values
        this.zoneTerm.value = zone.term;
        this.zoneX.value = zone.x;
        this.zoneY.value = zone.y;
        this.zoneWidth.value = zone.width;
        this.zoneHeight.value = zone.height;
        
        this.zoneConfig.style.display = 'block';
    }

    addDropZone() {
        const newZone = {
            id: `zone-${Date.now()}`,
            term: '',
            x: 50,
            y: 50,
            width: 15,
            height: 10
        };
        
        this.dropZones.push(newZone);
        this.renderDropZones();
        this.selectZone(newZone);
    }

    saveZone() {
        if (!this.selectedZone) return;
        
        console.log('Saving zone:', this.selectedZone.id);
        console.log('Term value:', this.zoneTerm.value);
        
        this.selectedZone.term = this.zoneTerm.value;
        this.selectedZone.x = parseFloat(this.zoneX.value);
        this.selectedZone.y = parseFloat(this.zoneY.value);
        this.selectedZone.width = parseFloat(this.zoneWidth.value);
        this.selectedZone.height = parseFloat(this.zoneHeight.value);
        
        console.log('Updated zone data:', this.selectedZone);
        
        this.renderDropZones();
        this.saveDropZones();
        this.zoneConfig.style.display = 'none';
        this.selectedZone = null;
    }

    cancelZoneEdit() {
        this.zoneConfig.style.display = 'none';
        if (this.selectedZone) {
            const zoneElement = document.getElementById(this.selectedZone.id);
            if (zoneElement) zoneElement.classList.remove('selected');
            this.selectedZone = null;
        }
    }

    deleteZone() {
        if (!this.selectedZone) return;
        
        this.dropZones = this.dropZones.filter(z => z.id !== this.selectedZone.id);
        this.renderDropZones();
        this.saveDropZones();
        this.zoneConfig.style.display = 'none';
        this.selectedZone = null;
    }

    clearAllTerms() {
        // Clear all term assignments but keep the zones
        this.dropZones.forEach(zone => {
            zone.term = '';
        });
        
        // Hide zone config if it's open
        this.zoneConfig.style.display = 'none';
        this.selectedZone = null;
        
        // Re-render and save
        this.renderDropZones();
        this.saveDropZones();
        
        // Show feedback
        this.showFeedback('All terms cleared. Zones remain in place.', 'success');
    }

    saveToFile() {
        if (!this.currentActivity) {
            this.showFeedback('No activity loaded. Please load an activity first.', 'error');
            return;
        }

        // Create the setup data
        const setupData = {
            activityName: this.currentActivity.name,
            dropZones: this.dropZones,
            savedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        // Create and download the file
        const setupFileName = `${this.currentActivity.name}_setup.json`;
        const blob = new Blob([JSON.stringify(setupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = setupFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showFeedback(`Setup saved to ${setupFileName}. Place this file in the Activities/${this.currentActivity.name}/ folder to make it permanent. The app will automatically load this setup data when you reload the activity.`, 'success');
    }

    switchToStudentMode() {
        console.log('Switching to student mode...');
        console.log('Current drop zones:', this.dropZones);
        
        // Get only the terms that are assigned to zones
        const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
        console.log('Assigned terms:', assignedTerms);
        
        if (assignedTerms.length === 0) {
            this.showFeedback('Please assign at least one term to a drop zone before switching to student mode.', 'error');
            return;
        }
        
        // Save current zone positions before switching
        this.saveDropZones();
        
        // Ensure zones are synchronized
        this.synchronizeZonePositions();
        
        console.log('Switching to student mode...');
        this.showStudentMode();
        this.showFeedback('Switched to Student Mode! Click "Start Activity" to begin.', 'success');
    }

    saveDropZones() {
        localStorage.setItem(`dropZones_${this.currentActivity.name}`, JSON.stringify(this.dropZones));
    }

    updateTermAssignments() {
        const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
        console.log('Updating term assignments. Assigned terms:', assignedTerms);
        
        const termItems = this.termsList.querySelectorAll('.term-item');
        
        termItems.forEach(item => {
            const term = item.dataset.term;
            if (assignedTerms.includes(term)) {
                item.classList.add('assigned');
                console.log(`Term "${term}" is assigned`);
            } else {
                item.classList.remove('assigned');
                console.log(`Term "${term}" is NOT assigned`);
            }
        });
        
        // Update the Switch to Student button state (in teacher mode)
        const hasAssignedTerms = assignedTerms.length > 0;
        if (this.switchToStudentBtn) {
            this.switchToStudentBtn.disabled = !hasAssignedTerms;
            this.switchToStudentBtn.style.opacity = hasAssignedTerms ? '1' : '0.5';
        }
        
        // Update the Clear Terms button state
        if (this.clearTermsBtn) {
            this.clearTermsBtn.disabled = assignedTerms.length === 0;
            this.clearTermsBtn.style.opacity = assignedTerms.length > 0 ? '1' : '0.5';
        }
    }

    startActivity() {
        console.log('Start Activity button clicked');
        
        // Start timer
        this.startTimer();
        
        // Reset activity state
        this.correctPlacements = 0;
        this.placedLabels.clear();
        this.isActivityActive = true;
        
        // Enable dragging on all labels
        const draggableLabels = this.labelsContainer.querySelectorAll('.draggable-label');
        draggableLabels.forEach(label => {
            label.draggable = true;
            label.style.opacity = '1';
        });
        
        // Hide the start activity button
        this.startActivityBtn.style.display = 'none';
        
        console.log('Setting up drag and drop...');
        this.setupDragAndDrop();
        
        console.log('Updating progress...');
        this.updateProgress();
        
        // Show success feedback
        this.showFeedback('🎯 Activity started! Drag the labels to the correct zones.', 'success');
    }

    createActivityDropZones() {
        this.activityDropZones.innerHTML = '';
        
        this.dropZones.forEach(zone => {
            if (zone.term) { // Only create zones that have terms assigned
                this.createZoneElement(zone, false);
            }
        });
    }

    createDraggableLabels() {
        this.labelsContainer.innerHTML = '<h3>Terms to Place:</h3>';
        
        // Only show terms that are assigned to zones
        const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
        
        if (assignedTerms.length === 0) {
            // No terms assigned - this will be handled in showStudentMode
            return;
        }
        
        assignedTerms.forEach(term => {
            const label = document.createElement('div');
            label.className = 'draggable-label';
            label.draggable = false; // Start with dragging disabled
            label.dataset.label = term;
            label.innerHTML = `<span>${term}</span>`;
            this.labelsContainer.appendChild(label);
        });
    }

    setupDragAndDrop() {
        const draggableLabels = this.labelsContainer.querySelectorAll('.draggable-label');
        const dropZones = this.activityDropZones.querySelectorAll('.drop-zone');

        draggableLabels.forEach(label => {
            label.addEventListener('dragstart', (e) => this.handleDragStart(e));
            label.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    handleDragStart(e) {
        if (this.placedLabels.has(e.target.dataset.label)) {
            e.preventDefault();
            return;
        }

        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        
        const dropZones = this.activityDropZones.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('highlight');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (this.draggedElement && !this.placedLabels.has(this.draggedElement.dataset.label)) {
            e.target.classList.add('highlight');
        }
    }

    handleDragLeave(e) {
        e.target.classList.remove('highlight');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('highlight');

        if (!this.draggedElement) return;

        const labelType = this.draggedElement.dataset.label;
        const targetZone = e.target.dataset.target;

        if (this.placedLabels.has(labelType)) {
            this.showFeedback('This label has already been placed!', 'error');
            return;
        }

        if (e.target.querySelector('.placed-label')) {
            this.showFeedback('This area already has a label!', 'error');
            return;
        }

        if (labelType === targetZone) {
            this.handleCorrectPlacement(e.target, this.draggedElement);
        } else {
            this.handleIncorrectPlacement(e.target, this.draggedElement);
        }
    }

    handleCorrectPlacement(dropZone, label) {
        const placedLabel = label.cloneNode(true);
        placedLabel.classList.remove('dragging');
        placedLabel.classList.add('placed-label');
        placedLabel.draggable = false;
        
        dropZone.appendChild(placedLabel);
        dropZone.classList.add('correct');
        dropZone.classList.add('correct-placement');

        label.classList.add('placed');
        label.draggable = false;

        this.placedLabels.add(label.dataset.label);
        this.correctPlacements++;
        this.updateProgress();

        this.showFeedback(`Correct! ${label.querySelector('span').textContent} is in the right place!`, 'success');

        const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
        if (this.correctPlacements === assignedTerms.length) {
            // Activity completed
            this.completeActivity();
        }

        setTimeout(() => {
            dropZone.classList.remove('correct-placement');
        }, 500);
    }

    completeActivity() {
        // Stop the timer
        this.stopTimer();
        this.isActivityActive = false;
        
        // Show completion message
        setTimeout(() => {
            this.showFeedback('🎉 Congratulations! You\'ve completed the activity! 🎉', 'complete');
            
            // Show submit button
            this.submitScoreBtn.style.display = 'inline-block';
        }, 1000);
    }

    startTimer() {
        this.activityStartTime = new Date();
        this.timerDisplay.textContent = '00:00';
        
        this.timerInterval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - this.activityStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.activityEndTime = new Date();
    }

    getActivityDuration() {
        if (!this.activityStartTime) return 0;
        
        const endTime = this.activityEndTime || new Date();
        return Math.floor((endTime - this.activityStartTime) / 1000);
    }

    submitScore() {
        // Prepare score data with all required fields
        const scoreData = {
            studentName: this.studentName,
            assignmentName: this.currentActivity.displayName,
            score: this.correctPlacements,
            totalTerms: this.dropZones.map(z => z.term).filter(t => t).length,
            percentage: Math.round((this.correctPlacements / this.dropZones.map(z => z.term).filter(t => t).length) * 100),
            timer: this.getActivityDuration(), // Duration in seconds
            timeSubmitted: new Date().toISOString(), // Current timestamp
            activityName: this.currentActivity.name,
            activityStartTime: this.activityStartTime ? this.activityStartTime.toISOString() : null,
            activityEndTime: this.activityEndTime ? this.activityEndTime.toISOString() : null,
            // Additional useful data
            completedAt: new Date().toISOString(),
            durationFormatted: `${Math.floor(this.getActivityDuration() / 60)}:${(this.getActivityDuration() % 60).toString().padStart(2, '0')}`
        };

        console.log('Score data to submit:', scoreData);
        
        // Show immediate feedback
        this.showFeedback(`Preparing to submit score: ${scoreData.score}/${scoreData.totalTerms} (${scoreData.percentage}%) in ${scoreData.durationFormatted}`, 'success');
        
        // Submit to Google Sheets using form submission
        this.submitToGoogleSheet(scoreData.studentName, scoreData.score, scoreData.timer);
        
        // Disable submit button after submission
        this.submitScoreBtn.disabled = true;
        this.submitScoreBtn.textContent = 'Score Submitted';
        
        // Show success message
        this.showFeedback('✅ Score submitted successfully! Your results have been recorded.', 'success');
        
        // Fallback: also store locally and create downloadable report
        this.handleScoreSubmissionFallback(scoreData);
    }

    submitToGoogleSheet(studentName, quizScore, duration) {
        // Calculate percentage
        const totalTerms = this.dropZones.map(z => z.term).filter(t => t).length;
        const percentage = Math.round((quizScore / totalTerms) * 100);
        
        // Convert duration from seconds to minutes
        const durationMinutes = Math.round((duration / 60) * 100) / 100; // Round to 2 decimal places
        
        // Set the form values
        document.getElementById('formName').value = studentName;
        document.getElementById('formAssignmentName').value = this.currentActivity.displayName;
        document.getElementById('formTimeSubmitted').value = new Date().toISOString();
        document.getElementById('formScore').value = quizScore;
        document.getElementById('formPercentage').value = percentage;
        document.getElementById('formDuration').value = durationMinutes;
        
        // Debug: Log what we're setting
        console.log('Setting form values:');
        console.log('- name:', studentName);
        console.log('- assignmentName:', this.currentActivity.displayName);
        console.log('- timeSubmitted:', new Date().toISOString());
        console.log('- score:', quizScore);
        console.log('- percentage:', percentage);
        console.log('- duration:', durationMinutes);
        
        // Submit the form
        document.getElementById('googleSheetForm').submit();
        
        // Optional: Show success message
        console.log('Quiz results sent to Google Sheets!');
        console.log('Data sent:', {
            name: studentName,
            assignmentName: this.currentActivity.displayName,
            timeSubmitted: new Date().toISOString(),
            score: quizScore,
            percentage: percentage,
            duration: durationMinutes
        });
    }

    handleIncorrectPlacement(dropZone, label) {
        dropZone.classList.add('incorrect');
        this.showFeedback(`Incorrect! ${label.querySelector('span').textContent} doesn't belong there.`, 'error');

        setTimeout(() => {
            dropZone.classList.remove('incorrect');
        }, 500);
    }

    updateProgress() {
        const assignedTerms = this.dropZones.map(z => z.term).filter(t => t);
        const percentage = (this.correctPlacements / assignedTerms.length) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${this.correctPlacements} of ${assignedTerms.length} labels placed correctly`;
    }

    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
        
        setTimeout(() => {
            this.feedback.textContent = '';
            this.feedback.className = 'feedback';
        }, 3000);
    }

    resetActivity() {
        // Stop timer if running
        if (this.isActivityActive) {
            this.stopTimer();
            this.isActivityActive = false;
        }
        
        this.correctPlacements = 0;
        this.placedLabels.clear();

        const draggableLabels = this.labelsContainer.querySelectorAll('.draggable-label');
        draggableLabels.forEach(label => {
            label.classList.remove('placed');
            label.draggable = false; // Reset to initial state
        });

        const dropZones = this.activityDropZones.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('correct', 'incorrect', 'highlight');
            const placedLabel = zone.querySelector('.placed-label');
            if (placedLabel) {
                placedLabel.remove();
            }
        });

        // Reset timer display
        this.timerDisplay.textContent = '00:00';
        
        // Hide submit button
        this.submitScoreBtn.style.display = 'none';
        
        // Show start activity button again
        this.startActivityBtn.style.display = 'inline-block';

        this.updateProgress();
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        this.showFeedback('Activity reset! Click "Start Activity" to begin again.', 'success');
    }

    backToSelectionFromStudent() {
        // This method preserves the student name when going back to selection
        this.showSelectionMode();
        this.showFeedback('Returned to activity selection. Your name is preserved.', 'success');
    }

    checkTeacherPassword() {
        const inputPassword = this.teacherPasswordInput.value;
        if (inputPassword === this.teacherPassword) {
            this.isTeacherModeUnlocked = true;
            this.showFeedback('Teacher mode unlocked!', 'success');
            this.hidePasswordModal();
            this.showTeacherMode();
        } else {
            this.showFeedback('Incorrect password. Please try again.', 'error');
            this.teacherPasswordInput.value = ''; // Clear input on error
        }
    }

    hidePasswordModal() {
        this.passwordModal.style.display = 'none';
    }

    createScoreReport(scoreData) {
        // Create a downloadable score report as JSON
        const reportData = {
            ...scoreData,
            reportGeneratedAt: new Date().toISOString(),
            reportType: 'student_score_report'
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `score_report_${this.studentName}_${this.currentActivity.name}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Score report downloaded:', reportData);
    }

    initializeScoreSubmission() {
        // This method will be used to set up Google Form submission
        console.log('Score submission system initialized for Google Form submission');
        console.log('Using Google Form submission method with URL:', this.scoreSubmissionConfig.googleFormUrl);
    }

    handleScoreSubmissionFallback(scoreData) {
        // Store score in localStorage as backup
        const storedScores = JSON.parse(localStorage.getItem('dragDropScores') || '[]');
        storedScores.push({
            ...scoreData,
            storedAt: new Date().toISOString()
        });
        localStorage.setItem('dragDropScores', JSON.stringify(storedScores));
        
        // Create downloadable report
        this.createScoreReport(scoreData);
        
        this.showFeedback('📋 Score saved locally and report downloaded. Please contact your teacher to submit manually.', 'info');
        console.log('Score stored locally as backup:', scoreData);
    }

    getStoredScores() {
        const storedScores = JSON.parse(localStorage.getItem('dragDropScores') || '[]');
        return storedScores;
    }

    clearStoredScores() {
        localStorage.removeItem('dragDropScores');
        this.showFeedback('All stored scores cleared.', 'success');
    }

    exportStoredScores() {
        const storedScores = this.getStoredScores();
        if (storedScores.length === 0) {
            this.showFeedback('No stored scores found.', 'info');
            return;
        }
        
        const blob = new Blob([JSON.stringify(storedScores, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stored_scores_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showFeedback(`Exported ${storedScores.length} stored scores.`, 'success');
    }
}

// Zoom and pan functionality
const zoomLevels = {};
const panOffsets = {};
let isPanning = false, startX, startY;

function zoomImage(direction, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!zoomLevels[containerId]) zoomLevels[containerId] = 1;
    if (!panOffsets[containerId]) panOffsets[containerId] = { x: 0, y: 0 };

    if (direction === 'in') zoomLevels[containerId] += 0.1;
    if (direction === 'out') zoomLevels[containerId] = Math.max(0.5, zoomLevels[containerId] - 0.1); // allow down to 0.5x

    applyZoomAndPan(containerId);
}

function resetZoom(containerId) {
    zoomLevels[containerId] = 1;
    panOffsets[containerId] = { x: 0, y: 0 };
    applyZoomAndPan(containerId);
}

function applyZoomAndPan(containerId) {
    const container = document.getElementById(containerId);
    const scale = zoomLevels[containerId];
    const offset = panOffsets[containerId];

    container.style.transform = `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`;
    container.style.transformOrigin = 'top left';

    if (scale > 1) {
        container.classList.add('zoomed');
    } else {
        container.classList.remove('zoomed');
    }
}

// Panning logic
document.addEventListener('mousedown', e => {
    const container = e.target.closest('.image-container.zoomed');
    if (!container) return;

    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    container.dataset.panId = container.id;
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const containerId = document.querySelector('.image-container.zoomed')?.dataset.panId;
    const offset = panOffsets[containerId];
    offset.x += e.clientX - startX;
    offset.y += e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    applyZoomAndPan(containerId);
});

document.addEventListener('mouseup', () => {
    isPanning = false;
});

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicDragDropActivity();
});

console.log('Dynamic Drag and Drop Activity App loaded successfully!');
console.log('Features:');
console.log('- Dynamic activity loading from Activities folder');
console.log('- Setup mode for configuring drop zones');
console.log('- Drag and drop functionality');
console.log('- Progress tracking and feedback');
console.log('- Local storage for saving zone configurations');
console.log('- Google Form score submission'); 