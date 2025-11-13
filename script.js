// --- DOM Elements ---
const form = document.getElementById('promptForm');
const generateButton = document.getElementById('generateButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');
const notification = document.getElementById('notification');

// --- UTILITY FUNCTIONS ---

function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
        notification.classList.remove('opacity-100', 'translate-y-0');
        notification.classList.add('opacity-0', 'translate-y-5');
        setTimeout(() => notification.classList.add('hidden'), 300);
    }, 2000);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; 
    textarea.style.top = 0;
    textarea.style.left = 0;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        // Gunakan document.execCommand('copy') untuk kompatibilitas iframe
        document.execCommand('copy');
        showNotification('Prompt berhasil disalin!');
    } catch (err) {
        showNotification('Gagal menyalin. Silakan coba manual.');
    }
    document.body.removeChild(textarea);
}

function generateMockPrompts(data) {
    const { storyIdea, mediaType, genre, duration, sceneCount, outputFormat } = data;
    // Bersihkan durasi dan format
    const cleanDuration = duration.split(' ')[0]; 
    const cleanFormat = outputFormat.includes('JSON') ? 'json' : 'paragraph';

    const prompts = [];
    const mockDescriptions = [
        `Latar adegan ${mediaType} ${genre} berlanjut. Karakter utama menghadapi rintangan pertamanya. Cahaya redup, detail visual tajam, nuansa futuristik monokrom.`,
        `Adegan ${mediaType} ${genre} berikutnya. Karakter utama menemukan petunjuk penting. Suasana tenang namun intens. Sudut kamera berputar ${cleanDuration} detik, low-angle.`,
        `Puncak emosional ${mediaType} ${genre}. Karakter utama membuat keputusan yang sulit. Warna abu-abu mendominasi, hanya mata karakter yang berpendar putih. Durasi tepat ${cleanDuration} detik.`,
        `Transisi cepat. Karakter utama bergerak melalui lanskap digital abstrak. Efek partikel berpijar ${cleanDuration} detik.`,
        `Adegan penutup. Karakter utama mencapai tujuan kecil. Cahaya matahari buatan memenuhi ruangan. Gaya visual yang sangat minimalis, durasi ${cleanDuration} detik.`,
        `Tembakan close-up pada mata karakter utama. Mencerminkan ketakutan dan harapan yang kontras. Warna hanya hitam dan putih.`,
        `Aksi ${genre} cepat. Karakter utama menghindari sistem keamanan laser. Gerakan halus, kecepatan tinggi, durasi ${cleanDuration} detik.`,
        `Dialog singkat di tengah badai pasir Sci-Fi. Hanya siluet karakter yang terlihat. Efek angin lembut.`,
        `Karakter utama beristirahat. Pemandangan kota yang hancur terlihat dari jendela. Kesedihan yang tenang dalam durasi ${cleanDuration} detik.`,
        `Sebuah mesin kuno mulai hidup. Roda gigi perunggu berputar lambat, menghasilkan uap monokrom.`,
    ];

    for (let i = 1; i <= sceneCount; i++) {
        const description = mockDescriptions[(i - 1) % mockDescriptions.length];
        const title = `${genre} | Scene ${i} / ${sceneCount}`;
        let content;

        if (cleanFormat === 'json') {
            content = JSON.stringify({
                scene_number: i,
                base_idea: storyIdea.substring(0, 50) + '...',
                media_type: mediaType,
                genre: genre,
                duration_seconds: parseInt(cleanDuration),
                visual_style: "Futuristic, high detail, black and white monochrome",
                description: description,
                camera_shot: i % 2 === 0 ? "Wide shot, perlahan geser ke kiri" : "Close-up, steady, 50mm",
                mood: i % 3 === 0 ? "Tegang dan hening" : "Elegance dan misterius"
            }, null, 2);
        } else { // paragraph format
            content = `[Scene ${i}] | Durasi: ${cleanDuration} detik\n---\n${description}\n\nKonteks: Berdasarkan ide utama: "${storyIdea.substring(0, 80)}...". Visual Style: Futuristic, High Detail, Black and White Monochrome.`;
        }
        
        prompts.push({ title, content, delay: i * 150 }); 
    }
    return prompts;
}

// --- HANDLE FORM SUBMISSION ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Ambil data langsung dari elemen form
    const formData = {
        storyIdea: document.getElementById('storyIdea').value.trim(),
        mediaType: document.getElementById('mediaType').value,
        genre: document.getElementById('genre').value,
        duration: document.getElementById('duration').value,
        outputFormat: document.getElementById('outputFormat').value,
        sceneCount: parseInt(document.getElementById('sceneCount').value),
    };

    // 2. Validasi semua harus terisi (karena required di HTML)
    if (!formData.storyIdea || !formData.mediaType || !formData.genre || !formData.duration || !formData.outputFormat || isNaN(formData.sceneCount)) {
        showNotification('Harap lengkapi semua kolom input yang bertanda (*).');
        return;
    }

    // 3. Tampilkan Loading, Sembunyikan Hasil Lama
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('hidden');
    generateButton.disabled = true;
    generateButton.textContent = 'Analyzing...';
    loadingIndicator.classList.remove('hidden', 'opacity-0');
    loadingIndicator.classList.add('opacity-100');

    // 4. Simulasi Proses Generasi (2 detik delay)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Buat Prompt Tiruan
    const generatedPrompts = generateMockPrompts(formData);

    // 6. Sembunyikan Loading, Tampilkan Hasil
    loadingIndicator.classList.remove('opacity-100');
    loadingIndicator.classList.add('opacity-0');
    setTimeout(() => loadingIndicator.classList.add('hidden'), 500);
    
    generateButton.disabled = false;
    generateButton.textContent = 'Generate Prompt';
    
    resultsContainer.classList.remove('hidden');
    
    // 7. Tampilkan Kartu Hasil dengan efek fade/slide berurutan
    generatedPrompts.forEach((promptData, index) => {
        const card = document.createElement('div');
        card.className = `card-appear bg-black/50 p-5 rounded-xl border border-gray-800 shadow-xl shadow-gray-900/50`;
        
        const contentTag = formData.outputFormat.includes('JSON') ? 'pre' : 'div';

        card.innerHTML = `
            <h3 class="text-lg font-medium text-white mb-3 border-b border-gray-800/50 pb-2">${promptData.title}</h3>
            <${contentTag} class="whitespace-pre-wrap text-xs font-mono p-3 rounded-lg bg-gray-900/80 text-gray-300 overflow-x-auto border border-gray-700/50">${promptData.content}</${contentTag}>
            <div class="mt-3 flex justify-end">
                <button class="copy-btn px-3 py-1.5 text-xs rounded-full bg-gray-700 text-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-wide" data-prompt-content="${promptData.content.replace(/"/g, '&quot;')}">
                    Salin Prompt
                </button>
            </div>
        `;
        
        setTimeout(() => {
            resultsContainer.appendChild(card);
            card.querySelector('.copy-btn').addEventListener('click', (e) => {
                // Ambil dan decode konten prompt dari atribut data
                const contentToCopy = e.currentTarget.getAttribute('data-prompt-content').replace(/&quot;/g, '"');
                copyToClipboard(contentToCopy);
            });
        }, promptData.delay); 
    });
    
    // Scroll ke hasil
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 700);
});
