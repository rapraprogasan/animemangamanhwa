// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading screen
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialize manga list from localStorage
    let mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    
    // DOM Elements
    const addMangaBtn = document.getElementById('add-manga-btn');
    const addModal = document.getElementById('add-modal');
    const editModal = document.getElementById('edit-modal');
    const videoModal = document.getElementById('video-modal');
    const closeModalButtons = document.querySelectorAll('.close');
    const mangaForm = document.getElementById('manga-form');
    const editForm = document.getElementById('edit-form');
    const mangaListContainer = document.getElementById('manga-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('global-search');
    
    // Show add modal
    addMangaBtn.addEventListener('click', function() {
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
    
    // Add new manga
    mangaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newManga = {
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
        
        mangaList.push(newManga);
        saveMangaList();
        
        // Update the counts on the main page
        if (window.opener) {
            window.opener.updateTitleCounts();
        }
        
        renderMangaList();
        mangaForm.reset();
        addModal.style.display = 'none';
        
        alert('Manga added successfully!');
    });
    
    // Edit manga form submission
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
        
        // Find and update the manga
        const mangaIndex = mangaList.findIndex(manga => manga.id === id);
        if (mangaIndex !== -1) {
            mangaList[mangaIndex] = {
                ...mangaList[mangaIndex],
                title,
                image: image || 'https://via.placeholder.com/300x200?text=No+Image',
                status,
                rating,
                chapters,
                notes,
                link
            };
            
            saveMangaList();
            renderMangaList();
            editModal.style.display = 'none';
            
            alert('Manga updated successfully!');
        }
    });
    
    // Filter manga
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            renderMangaList(filter);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredManga = mangaList.filter(manga => 
            manga.title.toLowerCase().includes(searchTerm)
        );
        renderFilteredMangaList(filteredManga);
    });
    
    // Save manga list to localStorage
    function saveMangaList() {
        localStorage.setItem('mangaList', JSON.stringify(mangaList));
        saveDataToDrive(); // Save to Google Drive
    }
    
    // Render manga list
    function renderMangaList(filter = 'all') {
        let filteredManga = mangaList;
        
        if (filter !== 'all') {
            filteredManga = mangaList.filter(manga => manga.status === filter);
        }
        
        renderFilteredMangaList(filteredManga);
    }
    
    // Render filtered manga list
    function renderFilteredMangaList(list) {
        mangaListContainer.innerHTML = '';
        
        if (list.length === 0) {
            mangaListContainer.innerHTML = '<p class="no-items">No manga found. Add some to your list!</p>';
            return;
        }
        
        list.forEach(manga => {
            const mangaCard = document.createElement('div');
            mangaCard.className = 'item-card';
            mangaCard.innerHTML = `
                <div class="item-image">
                    <img src="${manga.image}" alt="${manga.title}">
                    <div class="play-overlay">
                        <div class="play-btn" data-video="${manga.video}">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="item-details">
                    <h3 class="item-title">${manga.title}</h3>
                    <span class="item-status ${getStatusClass(manga.status)}">${formatStatus(manga.status)}</span>
                    ${manga.rating ? `<div class="item-rating"><i class="fas fa-star"></i> ${manga.rating}/10</div>` : ''}
                    ${manga.chapters ? `<div class="item-progress">Chapters: ${manga.chapters}</div>` : ''}
                    <p class="item-notes">${manga.notes || 'No notes added.'}</p>
                    <div class="item-actions">
                        ${manga.link ? `<a href="${manga.link}" target="_blank" class="action-btn link-btn"><i class="fas fa-external-link-alt"></i> Visit</a>` : ''}
                        <button class="action-btn edit-btn" data-id="${manga.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn delete-btn" data-id="${manga.id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
            
            mangaListContainer.appendChild(mangaCard);
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
                if (confirm('Are you sure you want to delete this manga?')) {
                    mangaList = mangaList.filter(manga => manga.id !== id);
                    saveMangaList();
                    
                    // Update the counts on the main page
                    if (window.opener) {
                        window.opener.updateTitleCounts();
                    }
                    
                    renderMangaList();
                }
            });
        });
        
        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const manga = mangaList.find(m => m.id === id);
                
                if (manga) {
                    // Populate the edit form with manga data
                    document.getElementById('edit-id').value = manga.id;
                    document.getElementById('edit-title').value = manga.title;
                    document.getElementById('edit-image').value = manga.image;
                    document.getElementById('edit-status').value = manga.status;
                    document.getElementById('edit-rating').value = manga.rating || '';
                    document.getElementById('edit-chapters').value = manga.chapters || '';
                    document.getElementById('edit-notes').value = manga.notes || '';
                    document.getElementById('edit-link').value = manga.link || '';
                    
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
    renderMangaList();
});