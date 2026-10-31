/* Automatic browser startup and save-only controls. SPDX-License-Identifier: LGPL-3.0-or-later. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const mutations = [uploadSaveImportBtn, uploadSaveImportDirBtn, uploadSaveClearBtn, el('add-test-profiles')];
  let bundleReady = false, starting = false, scheduled = false, loading = null, engineFailed = false;
  let showImportOnLoad = false;
  try {
    showImportOnLoad = sessionStorage.getItem('pvz-show-import') === '1';
    sessionStorage.removeItem('pvz-show-import');
    sessionStorage.removeItem('pvz-show-files');
  } catch (_) {}
  function hasOpenPanel() { return el('more-dialog').open || el('return-files-dialog').open; }
  function showFailure(error, engine = false) {
    engineFailed = engineFailed || engine;
    loadStatus.textContent = engine ? 'The game could not start. Retry to reload.' : 'The game could not download. Check your connection and retry.';
    loadStatus.classList.add('has-error'); loadStatus.style.display = 'block';
    el('retry-load').hidden = false;
    console.error(engine ? 'Game startup failed.' : 'Game bundle load failed.', error);
  }
  function scheduleAutoStart() {
    if (scheduled || starting || gameStarted || !bundleReady || engineFailed || hasOpenPanel() || mutations.some(button => button.disabled)) return;
    scheduled = true;
    return Promise.resolve().then(() => window.startGame()).finally(() => { scheduled = false; });
  }
  function closeMore() { el('more-dialog').close(); el('more-btn').setAttribute('aria-expanded', 'false'); }
  function openMore(importing = false) {
    if (!el('more-dialog').open) el('more-dialog').showModal();
    el('more-btn').setAttribute('aria-expanded', 'true');
    if (importing) uploadSaveImportBtn.focus();
  }
  // The loader awaits this after copying resources and restoring saves, before
  // entering the untouched engine. Steam text fixes use only local game data.
  window.beforePvZStart = async () => {
    const FS = Module.FS;
    let compatibilityPresent = false;
    try { compatibilityPresent = FS.stat('/properties/pvz-portable.xml').size > 0; } catch (_) {}
    if (!compatibilityPresent && typeof buildSteamCompatibilityXml === 'function') {
      try {
        const xml = buildSteamCompatibilityXml(FS.readFile('/main.pak'));
        if (xml) FS.writeFile('/properties/pvz-portable.xml', new TextEncoder().encode(xml));
      } catch (error) { console.warn('Optional Steam text compatibility could not be generated.', error); }
    }
    await PVZAudio.prepareRegistry(FS);
  };

  const upstreamStartGame = window.startGame;
  window.startGame = async function () {
    if (starting || gameStarted || !bundleReady || engineFailed || hasOpenPanel() || mutations.some(button => button.disabled)) return;
    starting = true;
    el('retry-load').hidden = true;
    try {
      await window.moduleReadyPromise;
      if (hasOpenPanel() || mutations.some(button => button.disabled)) return;
      mutations.forEach(button => { button.disabled = true; });
      el('import-btn').disabled = true;
      // Autoplay may leave resume pending until a gesture. It must not hold
      // automatic game startup; the ordinary gesture listeners resume output.
      void PVZAudio.resume();
      await upstreamStartGame();
      if (!gameStarted) throw Error('Native startup did not complete.');
      document.title = 'Plants vs. Zombies';
      Module.canvas.focus({preventScroll: true});
    } catch (error) { showFailure(error, true); }
    finally {
      if (el('import-btn').disabled) {
        el('import-btn').disabled = false;
        mutations.forEach(button => { button.disabled = false; });
      }
      starting = false;
    }
  };
  const assets = PVZAssetBundle.createLoader({onProgress: state => {
    if (engineFailed) return;
    loadStatus.classList.remove('has-error');
    loadStatus.textContent = state.phase === 'manifest' ? 'Loading game...' :
      state.phase === 'ready' ? 'Starting game...' :
      'Loading game... ' + Math.floor(state.loaded / state.total * 100) + '%';
    loadStatus.style.display = 'block';
  }});
  function loadResources() {
    if (loading || gameStarted) return loading;
    el('retry-load').hidden = true;
    loading = (async () => {
      try {
        const bundle = await assets.load();
        collectedFiles.clear();
        for (const [path, file] of bundle.files) collectedFiles.set(path, file);
        bundleReady = true;
        await scheduleAutoStart();
        return true;
      } catch (error) { showFailure(error); return false; }
      finally { loading = null; }
    })();
    return loading;
  }
  el('retry-load').onclick = () => engineFailed ? window.location.reload() : loadResources();
  window.onSaveOperationFinished = scheduleAutoStart;
  PVZAudio.subscribe(muted => {
    const button = el('mute-btn');
    button.setAttribute('aria-pressed', String(muted));
    button.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    button.title = muted ? 'Unmute sound' : 'Mute sound';
  });
  el('mute-btn').onclick = () => { PVZAudio.setMuted(!PVZAudio.isMuted()); PVZAudio.resume(); };
  document.addEventListener('pointerdown', () => PVZAudio.resume(), {capture: true});
  document.addEventListener('keydown', () => { if (!hasOpenPanel()) PVZAudio.resume(); }, {capture: true});
  const keyboardRoots = ['save-toolbar', 'upload-screen', 'more-dialog', 'return-files-dialog'].map(el);
  for (const type of ['keydown', 'keypress', 'keyup']) {
    for (const root of keyboardRoots) root.addEventListener(type, event => event.stopPropagation());
    document.addEventListener(type, event => { if (hasOpenPanel()) event.stopPropagation(); });
  }
  el('more-btn').onclick = () => el('more-dialog').open ? closeMore() : openMore();
  el('more-close').onclick = closeMore;
  function requestSaveScreen() {
    closeMore(); el('return-files-status').textContent = '';
    el('return-files-dialog').showModal();
  }
  el('import-btn').onclick = () => gameStarted ? requestSaveScreen() : openMore(true);
  // Native profiles are held in RAM. Reload before importing so a later native
  // save cannot overwrite an imported profile index or settings.
  for (const button of mutations) button.addEventListener('click', event => {
    if (!gameStarted) return;
    event.preventDefault(); event.stopImmediatePropagation(); requestSaveScreen();
  }, {capture: true});
  el('more-dialog').addEventListener('close', () => {
    el('more-btn').setAttribute('aria-expanded', 'false');
    if (gameStarted) Module.canvas.focus({preventScroll: true});
    else scheduleAutoStart();
  });
  el('more-dialog').addEventListener('click', event => {
    if (event.target !== el('more-dialog')) return;
    const rect = el('more-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMore();
  });
  el('fullscreen-btn').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.body.requestFullscreen();
      resizeCanvas();
    } catch (error) { console.warn('Fullscreen is unavailable.', error); }
  };
  el('return-files-cancel').onclick = () => { el('return-files-dialog').close(); if (gameStarted) Module.canvas.focus({preventScroll: true}); };
  el('return-files-confirm').onclick = async () => {
    const button = el('return-files-confirm'); button.disabled = true; button.textContent = 'Saving...';
    try {
      await syncSaves();
      try { sessionStorage.setItem('pvz-show-import', '1'); } catch (_) {}
      window.location.reload();
    } catch (error) {
      button.disabled = false; button.textContent = 'Retry';
      el('return-files-status').textContent = 'Saves could not be stored. Keep this page open and retry.';
      console.error(error);
    }
  };
  el('add-test-profiles').onclick = async () => {
    const button = el('add-test-profiles');
    const status = el('test-profile-status');
    button.disabled = true;
    const otherButtons = [uploadSaveImportBtn, uploadSaveImportDirBtn, uploadSaveClearBtn];
    otherButtons.forEach(item => { item.disabled = true; });
    status.textContent = 'Adding separate playtest profiles…';
    try {
      await ensureSaveFsReady();
      const response = await fetch('./testing/test-profiles.zip');
      if (!response.ok) throw new Error('Test profiles could not be loaded.');
      const result = await addPvZTestProfiles(Module.FS, JSZip, new Uint8Array(await response.arrayBuffer()));
      await syncSaves();
      status.textContent = `${result.added.length ? result.added.length + ' test profiles added.' : 'The test profiles are already available.'} Start the game, then use the player-name sign to choose a QA profile. Your existing progress is kept.`;
    } catch (error) {
      console.error('Test profiles were not added.', error);
      status.textContent = 'Test profiles could not be added. Existing profiles were kept.';
    } finally {
      button.disabled = false;
      otherButtons.forEach(item => { item.disabled = false; });
      scheduleAutoStart();
    }
  };
  document.addEventListener('fullscreenchange', () => requestAnimationFrame(resizeCanvas));
  window.moduleReadyPromise.catch(error => showFailure(error, true));
  if (showImportOnLoad) openMore(true);
  window.PVZLaunch = Object.freeze({ready: loadResources(), retry: loadResources});
})();
