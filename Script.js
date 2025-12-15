// Educational Library - PDF Management System

class EducationalLibrary {
    constructor() {
        this.adminPassword = "808711"; // 👑 OWNER: अपना Admin Password यहां सेट करें
        this.pdfs = []; 
        this.currentPDF = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        this.checkAdminAccess(); // Must run first to set this.isAdmin
        this.pdfs = this.loadPDFs();
        this.setupEventListeners();
        this.renderPDFGrid();
        this.setupDragAndDrop();
        this.updateAdminStats(); 
        this.setupAdminPanel(); // Display/hide the button and panel
    }

    setupEventListeners() {
        // Upload area click (only if not admin)
        const uploadArea = document.getElementById('uploadArea');
        const pdfInput = document.getElementById('pdfInput');
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                if (!this.isAdmin) pdfInput.click();
            });
        }
        
        if (pdfInput) {
            pdfInput.addEventListener('change', (e) => {
                if (!this.isAdmin) this.handleFileSelect(e.target.files);
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchBtn) searchBtn.addEventListener('click', () => this.searchPDFs());
        if (searchInput) searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchPDFs();
        });

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const downloadBtn = document.getElementById('downloadBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadPDF());
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('pdfModal');
            if (modal && e.target === modal) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            
            // Admin access shortcut: Ctrl+Shift+A
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                toggleAdminLogin();
            }
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (!this.isAdmin) {
                const files = e.dataTransfer.files;
                this.handleFileSelect(files);
            } else {
                this.showToast('एडमिन पैनल का उपयोग करें / Use the Admin Panel to upload', 'info');
            }
        });
    }
    
    // --- Utility Methods ---

    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    showToast(message, type = 'info', duration = 3000) {
        let toast = document.getElementById('appToast');
        if (!toast) return; // Ensure toast element exists
        
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;

        setTimeout(() => {
            toast.className = 'toast';
        }, duration);
    }
    
    showUploadProgress() {
        const progressEl = document.getElementById('uploadProgress');
        if(progressEl) progressEl.style.display = 'flex';
    }

    hideUploadProgress() {
        const progressEl = document.getElementById('uploadProgress');
        if(progressEl) progressEl.style.display = 'none';
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if(progressFill) progressFill.style.width = '0%';
        if(progressText) progressText.textContent = 'Uploading... 0%';
    }

    simulateUploadProgress() {
        return new Promise(resolve => {
            let progress = 0;
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            const interval = setInterval(() => {
                progress += 10;
                if (progress <= 100) {
                    if(progressFill) progressFill.style.width = `${progress}%`;
                    if(progressText) progressText.textContent = `Uploading... ${progress}%`;
                } else {
                    clearInterval(interval);
                    if(progressFill) progressFill.style.width = '100%';
                    if(progressText) progressText.textContent = 'Upload Complete!';
                    resolve();
                }
            }, 100);
        });
    }
    
    // --- PDF Data Management ---

    loadPDFs() {
        try {
            const saved = localStorage.getItem('educationalLibrary_pdfs');
            if (saved) {
                const pdfsMetadata = JSON.parse(saved);
                this.showToast(`पुस्तकालय से ${pdfsMetadata.length} PDF लोड की गईं।`, 'info');
                return pdfsMetadata;
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }

        // 👑 OWNER: Pre-loaded PDFs (Fallback/Initial data)
        // Note: For GitHub Pages, these URLs (pdfs/...) must point to actual files in your repository.
        const preloadedPdfs = [
            {
                id: 1,
                name: "Class 10 Mathematics - NCERT.pdf",
                size: "15.2 MB",
                uploadDate: "15/01/2024",
                url: "pdfs/mathematics/class10.pdf" 
            },
            {
                id: 2,
                name: "Physics - Chapter 1 Motion.pdf",
                size: "8.5 MB",
                uploadDate: "15/01/2024",
                url: "pdfs/science/physics.pdf"
            },
            {
                id: 3,
                name: "Hindi Literature - Class 12.pdf",
                size: "12.3 MB",
                uploadDate: "15/01/2024",
                url: "pdfs/literature/hindi_sahitya.pdf"
            }
        ];
        this.showToast('Pre-loaded PDFs का उपयोग किया जा रहा है।', 'info');
        return preloadedPdfs;
    }

    savePDFs() {
        try {
            // Save only necessary metadata
            localStorage.setItem('educationalLibrary_pdfs', JSON.stringify(this.pdfs));
            this.updateAdminStats();
        } catch (e) {
            console.error('Could not save to localStorage:', e);
            this.showToast('PDFs save करने में त्रुटि हुई।', 'error');
        }
    }
    
    // --- Upload and Rendering ---

    async handleFileSelect(files) {
        const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showToast('कृपया केवल PDF फाइलें चुनें / Please select only PDF files', 'error');
            return;
        }

        let uploadCount = 0;
        for (const file of pdfFiles) {
            if (await this.uploadPDF(file)) {
                uploadCount++;
            }
        }
        
        this.renderPDFGrid();
        if (uploadCount > 0) {
            this.showToast(`${uploadCount} PDF फाइलें सफलतापूर्वक अपलोड हो गईं!`, 'success');
        }
    }

    async uploadPDF(file) {
        this.showUploadProgress();
        
        try {
            const reader = new FileReader();
            
            await new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    const pdfData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: this.formatFileSize(file.size),
                        uploadDate: new Date().toLocaleDateString('hi-IN'),
                        url: e.target.result // Use data URL for viewer
                    };
                    
                    this.pdfs.push(pdfData);
                    this.savePDFs();
                    resolve();
                };
                
                reader.onerror = (e) => {
                    reject(new Error('Error reading file: ' + e.target.error.message));
                };
                
                reader.readAsDataURL(file);
            });
            
            await this.simulateUploadProgress();
            
            this.hideUploadProgress();
            return true;
            
        } catch (error) {
            this.hideUploadProgress();
            this.showToast('अपलोड में त्रुटि हुई / Upload error: ' + error.message, 'error');
            return false;
        }
    }

    renderPDFGrid(searchQuery = '') {
        const grid = document.getElementById('pdfGrid');
        if (!grid) return;
        grid.innerHTML = '';
        
        const filteredPDFs = this.pdfs.filter(pdf => 
            pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredPDFs.length === 0) {
            grid.innerHTML = '<p class="no-results">कोई PDF नहीं मिली। / No PDFs found.</p>';
            return;
        }

        filteredPDFs.forEach(pdf => {
            const card = document.createElement('div');
            card.className = 'pdf-card';
            card.setAttribute('data-id', pdf.id);
            card.innerHTML = `
                <div class="pdf-icon">📄</div>
                <div class="pdf-info">
                    <div class="pdf-name" title="${pdf.name}">${pdf.name}</div>
                    <div class="pdf-meta">
                        <span>${pdf.size}</span>
                        <span>|</span>
                        <span>${pdf.uploadDate}</span>
                    </div>
                </div>
                <div class="pdf-actions">
                    <button class="view-btn" onclick="library.viewPDF(${pdf.id})">👁️ View</button>
                    ${this.isAdmin ? `<button class="delete-btn" onclick="library.deletePDF(${pdf.id})">❌ Delete</button>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    viewPDF(pdfId) {
        const pdf = this.pdfs.find(p => p.id === pdfId);
        if (!pdf) {
            this.showToast('PDF नहीं मिली / PDF not found', 'error');
            return;
        }

        this.currentPDF = pdf;
        const modal = document.getElementById('pdfModal');
        const pdfFrame = document.getElementById('pdfFrame');
        const downloadBtn = document.getElementById('downloadBtn');

        pdfFrame.src = pdf.url; 
        if (downloadBtn) downloadBtn.setAttribute('data-url', pdf.url);

        if (modal) modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('pdfModal');
        if (modal) modal.style.display = 'none';
        const pdfFrame = document.getElementById('pdfFrame');
        if(pdfFrame) pdfFrame.src = ''; 
        this.currentPDF = null;
    }

    downloadPDF() {
        if (!this.currentPDF) return;
        const link = document.createElement('a');
        link.href = this.currentPDF.url;
        link.download = this.currentPDF.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    toggleFullscreen() {
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame && pdfFrame.requestFullscreen) {
            pdfFrame.requestFullscreen();
        } else {
            this.showToast('फुलस्क्रीन इस ब्राउज़र में समर्थित नहीं है।', 'info');
        }
    }

    searchPDFs() {
        const query = document.getElementById('searchInput').value;
        this.renderPDFGrid(query);
    }
    
    deletePDF(pdfId) {
        if (!this.isAdmin) {
            this.showToast('एडमिन एक्सेस आवश्यक है / Admin access required!', 'error');
            return;
        }

        if (confirm('क्या आप वाकई इस PDF को हटाना चाहते हैं?')) {
            const initialLength = this.pdfs.length;
            this.pdfs = this.pdfs.filter(pdf => pdf.id !== pdfId);
            if (this.pdfs.length < initialLength) {
                this.savePDFs();
                this.renderPDFGrid();
                this.updateAdminStats();
                this.showToast('PDF सफलतापूर्वक हटाई गई।', 'success');
            }
        }
    }

    // --- Admin Panel Methods ---

    checkAdminAccess() {
        const isAdminLoggedIn = localStorage.getItem('educationalLibrary_adminLoggedIn') === 'true';
        this.isAdmin = isAdminLoggedIn;
        this.setupAdminPanel();
    }
    
    setupAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        const adminToggleBtn = document.getElementById('adminToggleBtn');
        const userUploadSection = document.getElementById('userUploadSection');
        const adminStatus = document.getElementById('adminStatus');

        if (this.isAdmin) {
            if (adminPanel) adminPanel.style.display = 'block';
            if (adminToggleBtn) adminToggleBtn.style.display = 'none';
            if (userUploadSection) userUploadSection.style.display = 'none'; 
            if (adminStatus) adminStatus.textContent = 'Logged in as Admin';
        } else {
            if (adminPanel) adminPanel.style.display = 'none';
            if (adminToggleBtn) adminToggleBtn.style.display = 'block';
            if (userUploadSection) userUploadSection.style.display = 'block';
        }
        this.updateAdminStats();
    }

    updateAdminStats() {
        if (!this.isAdmin) return;
        
        const totalPDFsElement = document.getElementById('totalPDFs');
        const totalSizeElement = document.getElementById('totalSize');
        const todayUploadsElement = document.getElementById('todayUploads');
        
        if (!totalPDFsElement || !totalSizeElement || !todayUploadsElement) return;

        totalPDFsElement.textContent = this.pdfs.length;
        totalSizeElement.textContent = 'N/A'; // Local storage doesn't track file sizes easily
        todayUploadsElement.textContent = '0'; // Placeholder
    }
    
    adminUploadPDFs() {
        if (!this.isAdmin) {
            this.showToast('एडमिन एक्सेस आवश्यक है / Admin access required!', 'error');
            return;
        }

        const adminPdfInput = document.getElementById('adminPdfInput');
        if (adminPdfInput.files.length > 0) {
            this.handleFileSelect(adminPdfInput.files);
            adminPdfInput.value = ''; // Clear input
        } else {
            this.showToast('अपलोड करने के लिए फ़ाइलें चुनें।', 'info');
        }
    }

    exportLibraryData() {
        if (!this.isAdmin) {
            this.showToast('एडमिन एक्सेस आवश्यक है / Admin access required!', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(this.pdfs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'educational_library_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        this.showToast('पुस्तकालय डेटा निर्यात किया गया।', 'success');
    }

    clearAllPDFs() {
        if (!this.isAdmin) {
            this.showToast('एडमिन एक्सेस आवश्यक है / Admin access required!', 'error');
            return;
        }

        if (confirm('चेतावनी: क्या आप वाकई सभी स्थानीय PDF हटाना चाहते हैं? (प्री-लोडेड PDF वापस आ जाएंगी)')) {
            localStorage.removeItem('educationalLibrary_pdfs');
            this.pdfs = this.loadPDFs(); // Reload with only pre-loaded static files
            this.renderPDFGrid();
            this.updateAdminStats();
            this.showToast('सभी स्थानीय PDF सफलतापूर्वक हटा दी गईं।', 'success');
        }
    }
    
    refreshLibrary() {
        this.init(); 
        this.showToast('पुस्तकालय रीफ़्रेश किया गया।', 'info');
    }
}

// --- Global Functions (Called by HTML onclick) ---

function toggleAdminLogin() {
    const overlay = document.getElementById('adminLoginOverlay');
    if (overlay) {
        if (overlay.style.display === 'block') {
            overlay.style.display = 'none';
        } else {
            overlay.style.display = 'block';
            const passwordInput = document.getElementById('adminPasswordInput');
            if(passwordInput) passwordInput.focus();
        }
    }
}

function closeAdminLogin() {
    const overlay = document.getElementById('adminLoginOverlay');
    if (overlay) overlay.style.display = 'none';
    const passwordInput = document.getElementById('adminPasswordInput');
    if(passwordInput) passwordInput.value = '';
}

function adminLogin() {
    const passwordInput = document.getElementById('adminPasswordInput');
    const password = passwordInput.value;
    const libraryInstance = window.library;

    if (password === libraryInstance.adminPassword) {
        libraryInstance.isAdmin = true;
        localStorage.setItem('educationalLibrary_adminLoggedIn', 'true');
        closeAdminLogin();
        libraryInstance.setupAdminPanel();
        libraryInstance.showToast('Admin Login Successful! 👑', 'success');
    } else {
        libraryInstance.showToast('Invalid Password!', 'error');
        passwordInput.value = '';
    }
}

function adminLogout() {
    const libraryInstance = window.library;
    libraryInstance.isAdmin = false;
    localStorage.removeItem('educationalLibrary_adminLoggedIn');
    libraryInstance.setupAdminPanel();
    libraryInstance.showToast('Logged out successfully', 'info');
}

function adminUploadPDFs() { window.library.adminUploadPDFs(); }
function exportLibraryData() { window.library.exportLibraryData(); }
function clearAllPDFs() { window.library.clearAllPDFs(); }
function refreshLibrary() { window.library.refreshLibrary(); }


// Initialize the library on page load
const library = new EducationalLibrary();
window.library = library;

      
