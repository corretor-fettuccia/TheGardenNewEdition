const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get('data');

  if (!dataParam) {
    document.getElementById('loading').innerText = "Erro: Nenhum dado informado.";
    throw new Error("Nenhum dado 'data' informado.");
  }

  // Decodificar e descomprimir
  const dadosJson = LZString.decompressFromBase64(dataParam);
  const dados = JSON.parse(dadosJson);

  const imageUrls = dados.files;
  const codigoImovel = dados.codigo;

  if (codigoImovel) {
    document.getElementById('codigo-imovel').textContent = `Código: ${codigoImovel}`;
  }

  const viewer = new PANOLENS.Viewer({
    container: document.getElementById('viewer'),
    controlBar: true,
    autoRotate: true,
    autoRotateSpeed: 0.3
  });

  viewer.camera.fov = 120; 
  viewer.camera.updateProjectionMatrix();

  const panoramas = imageUrls.map(url => new PANOLENS.ImagePanorama(url));

  panoramas.forEach(pano => {
    pano.addEventListener('load', () => {
      document.getElementById('loading').style.display = 'none';
    });
    pano.addEventListener('error', (e) => {
      document.getElementById('loading').innerText = "Erro ao carregar imagem 360°.";
      console.error("Erro ao carregar panorama:", e);
    });
    viewer.add(pano);
  });

  // Variáveis para controle do carrossel
  let currentIndex = 0;
  const thumbnailsContainer = document.getElementById('thumbnails');
  const thumbs = [];

  // Criar miniaturas
  panoramas.forEach((pano, index) => {
    const thumb = document.createElement('img');
    thumb.className = 'thumb';
    thumb.src = imageUrls[index];
    thumb.dataset.index = index;
    thumb.onclick = () => {
      selectThumb(index);
      viewer.setPanorama(pano);
    };
    thumbnailsContainer.appendChild(thumb);
    thumbs.push(thumb);
  });

  // Selecionar a miniatura ativa
  function selectThumb(index) {
    currentIndex = index;
    
    // Atualizar classes ativas
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
    
    // Centralizar a miniatura selecionada
    centerSelectedThumb();
  }

  // Centralizar a miniatura selecionada
  function centerSelectedThumb() {
    const thumbnailsWidth = thumbnailsContainer.scrollWidth;
    const containerWidth = thumbnailsContainer.parentElement.clientWidth;
    const selectedThumb = thumbs[currentIndex];
    
    if (!selectedThumb) return;
    
    const thumbOffset = selectedThumb.offsetLeft;
    const thumbWidth = selectedThumb.offsetWidth;
    const scrollPosition = thumbOffset - (containerWidth / 2) + (thumbWidth / 2);
    
    thumbnailsContainer.style.transform = `translateX(-${scrollPosition}px)`;
  }

  // Navegar para a miniatura anterior
  function prevThumb() {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      selectThumb(newIndex);
      viewer.setPanorama(panoramas[newIndex]);
    }
  }

  // Navegar para a próxima miniatura
  function nextThumb() {
    if (currentIndex < thumbs.length - 1) {
      const newIndex = currentIndex + 1;
      selectThumb(newIndex);
      viewer.setPanorama(panoramas[newIndex]);
    }
  }

  // Adicionar evento de roda do mouse para navegação
  thumbnailsContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    if (e.deltaY > 0) {
      nextThumb();
    } else {
      prevThumb();
    }
  });

  // Ajustar ao redimensionar a janela
  window.addEventListener('resize', () => {
    centerSelectedThumb();
  });

  // Iniciar com o primeiro panorama selecionado
  viewer.setPanorama(panoramas[0]);
  selectThumb(0);

  // Adicionar botões de navegação (opcional)
  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn';
  prevBtn.id = 'prev-btn';
  prevBtn.innerHTML = '&#10094;';
  prevBtn.onclick = prevThumb;
  document.getElementById('thumbnails-container').appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn';
  nextBtn.id = 'next-btn';
  nextBtn.innerHTML = '&#10095;';
  nextBtn.onclick = nextThumb;
  document.getElementById('thumbnails-container').appendChild(nextBtn);

  // Esconder botões se não houver necessidade
  function updateNavButtons() {
    prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
    nextBtn.style.display = currentIndex === thumbs.length - 1 ? 'none' : 'flex';
  }

  // Atualizar visibilidade dos botões
  setInterval(updateNavButtons, 100);
