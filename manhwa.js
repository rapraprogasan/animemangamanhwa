// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading screen
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialize manhwa list from localStorage
    let manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    
    // DOM Elements
    const addManhwaBtn = document.getElementById('add-manhwa-btn');
    const addModal = document.getElementById('add-modal');
    const editModal = document.getElementById('edit-modal');
    const videoModal = document.getElementById('video-modal');
    const closeModalButtons = document.querySelectorAll('.close');
    const manhwaForm = document.getElementById('manhwa-form');
    const editForm = document.getElementById('edit-form');
    const manhwaListContainer = document.getElementById('manhwa-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('global-search');
    
    // Show add modal
    addManhwaBtn.addEventListener('click', function() {
        addModal.style.display = 'flex';
    });
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            addModal.style.display = 'none';
            editModal.style.display = 'none';
            videoModal.style.display = 'none';
            document.getElementById('video-container').innerHTML = '';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        if (event.target === videoModal) {
            videoModal.style.display = 'none';
            document.getElementById('video-container').innerHTML = '';
        }
    });
    
    // Add new manhwa
    manhwaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newManhwa = {
            id: Date.now(),
            title: document.getElementById('title').value,
            image: document.getElementById('image').value || 'https://via.placeholder.com/300x200?text=No+Image',
            status: document.getElementById('status').value,
            rating: document.getElementById('rating').value,
            chapters: document.getElementById('chapters').value,
            notes: document.getElementById('notes').value,
            link: document.getElementById('link').value,
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Example video
        };
        
        manhwaList.push(newManhwa);
        saveManhwaList();
        
        // Update the counts on the main page
        if (window.opener) {
            window.opener.updateTitleCounts();
        }
        
        renderManhwaList();
        manhwaForm.reset();
        addModal.style.display = 'none';
        
        alert('Manhwa added successfully!');
    });
    
    // Edit manhwa form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('edit-id').value);
        const title = document.getElementById('edit-title').value;
        const image = document.getElementById('edit-image').value;
        const status = document.getElementById('edit-status').value;
        const rating = document.getElementById('edit-rating').value;
        const chapters = document.getElementById('edit-chapters').value;
        const notes = document.getElementById('edit-notes').value;
        const link = document.getElementById('edit-link').value;
        
        // Find and update the manhwa
        const manhwaIndex = manhwaList.findIndex(manhwa => manhwa.id === id);
        if (manhwaIndex !== -1) {
            manhwaList[manhwaIndex] = {
                ...manhwaList[manhwaIndex],
                title,
                image: image || 'https://via.placeholder.com/300x200?text=No+Image',
                status,
                rating,
                chapters,
                notes,
                link
            };
            
            saveManhwaList();
            renderManhwaList();
            editModal.style.display = 'none';
            
            alert('Manhwa updated successfully!');
        }
    });
    
    // Filter manhwa
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            renderManhwaList(filter);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredManhwa = manhwaList.filter(manhwa => 
            manhwa.title.toLowerCase().includes(searchTerm)
        );
        renderFilteredManhwaList(filteredManhwa);
    });
    
    // Save manhwa list to localStorage
    function saveManhwaList() {
        localStorage.setItem('manhwaList', JSON.stringify(manhwaList));
        saveDataToDrive(); // Save to Google Drive
    }
    
    // Render manhwa list
    function renderManhwaList(filter = 'all') {
        let filteredManhwa = manhwaList;
        
        if (filter !== 'all') {
            filteredManhwa = manhwaList.filter(manhwa => manhwa.status === filter);
        }
        
        renderFilteredManhwaList(filteredManhwa);
    }
    
    // Render filtered manhwa list
    function renderFilteredManhwaList(list) {
        manhwaListContainer.innerHTML = '';
        
        if (list.length === 0) {
            manhwaListContainer.innerHTML = '<p class="no-items">No manhwa found. Add some to your list!</p>';
            return;
        }
        
        list.forEach(manhwa => {
            const manhwaCard = document.createElement('div');
            manhwaCard.className = 'item-card';
            manhwaCard.innerHTML = `
                <div class="item-image">
                    <img src="${manhwa.image}" alt="${manhwa.title}">
                    <div class="play-overlay">
                        <div class="play-btn" data-video="${manhwa.video}">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="item-details">
                    <h3 class="item-title">${manhwa.title}</h3>
                    <span class="item-status ${getStatusClass(manhwa.status)}">${formatStatus(manhwa.status)}</span>
                    ${manhwa.rating ? `<div class="item-rating"><i class="fas fa-star"></i> ${manhwa.rating}/10</div>` : ''}
                    ${manhwa.chapters ? `<div class="item-progress">Chapters: ${manhwa.chapters}</div>` : ''}
                    <p class="item-notes">${manhwa.notes || 'No notes added.'}</p>
                    <div class="item-actions">
                        ${manhwa.link ? `<a href="${manhwa.link}" target="_blank" class="action-btn link-btn"><i class="fas fa-external-link-alt"></i> Visit</a>` : ''}
                        <button class="action-btn edit-btn" data-id="${manhwa.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn delete-btn" data-id="${manhwa.id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
            
            manhwaListContainer.appendChild(manhwaCard);
        });
        
        // Add event listeners for play buttons
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', function() {
                const videoUrl = this.getAttribute('data-video');
                document.getElementById('video-container').innerHTML = `
                    <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
                `;
                videoModal.style.display = 'flex';
            });
        });
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this manhwa?')) {
                    manhwaList = manhwaList.filter(manhwa => manhwa.id !== id);
                    saveManhwaList();
                    
                    // Update the counts on the main page
                    if (window.opener) {
                        window.opener.updateTitleCounts();
                    }
                    
                    renderManhwaList();
                }
            });
        });
        
        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const manhwa = manhwaList.find(m => m.id === id);
                
                if (manhwa) {
                    // Populate the edit form with manhwa data
                    document.getElementById('edit-id').value = manhwa.id;
                    document.getElementById('edit-title').value = manhwa.title;
                    document.getElementById('edit-image').value = manhwa.image;
                    document.getElementById('edit-status').value = manhwa.status;
                    document.getElementById('edit-rating').value = manhwa.rating || '';
                    document.getElementById('edit-chapters').value = manhwa.chapters || '';
                    document.getElementById('edit-notes').value = manhwa.notes || '';
                    document.getElementById('edit-link').value = manhwa.link || '';
                    
                    // Show the edit modal
                    editModal.style.display = 'flex';
                }
            });
        });
    }
    
    // Format status for display
    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Helper function to get the correct status class
    function getStatusClass(status) {
        const statusMap = {
            'currently-watching': 'status-currently-watching',
            'currently-reading': 'status-currently-reading',
            'completed': 'status-completed',
            'dropped': 'status-dropped',
            'plan-to-watch': 'status-plan-to-watch',
            'plan-to-read': 'status-plan-to-read'
        };
        return statusMap[status] || 'status-completed';
    }
    
    // Save data to Google Drive (simplified version)
    function saveDataToDrive() {
        // This is a simplified version - in a real app you'd use the Google Drive API
        const data = {
            animeList: JSON.parse(localStorage.getItem('animeList')) || [],
            mangaList: JSON.parse(localStorage.getItem('mangaList')) || [],
            manhwaList: JSON.parse(localStorage.getItem('manhwaList')) || [],
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('googleDriveData', JSON.stringify(data));
        console.log('Data saved to Google Drive backup');
    }
    
    // Initial render
    renderManhwaList();
});