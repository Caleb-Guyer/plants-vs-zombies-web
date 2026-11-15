/* Automatic save recovery controls. Copyright (C) 2026. MIT License. */
(function (global) {
  'use strict';
  const el = id => global.document.getElementById(id);
  let config, selected = null, busy = false, committed = false, acknowledge;
  const dialog = () => el('save-recovery-dialog');
  function label(node, text) {
    node.textContent = text;
    node.setAttribute('aria-label', text);
    global.PVZOriginalUI?.label(node, text);
  }
  function adapter() {
    const value = config?.getAdapter();
    if (!value?.historyAvailable) throw Error('Automatic backups are unavailable in this browser. You can still import or export saves.');
    return value;
  }
  function status(text) {el('save-recovery-status').textContent = text;}
  function setBusy(value) {
    busy = value;
    el('save-recovery-close').disabled = value || committed;
    el('save-recovery-restore').disabled = value || committed || !selected;
    el('save-recovery-list').setAttribute('aria-busy', String(value));
    for (const node of el('save-recovery-list').querySelectorAll('button')) node.disabled = value || committed;
  }
  function close() {
    if (busy || committed) return;
    dialog().close();
    try {config?.getAdapter()?.acknowledgeRecoveryNotice?.();} catch (_) {}
    if (acknowledge) {const resolve = acknowledge; acknowledge = null; resolve();}
    config?.onClose?.();
  }
  async function refresh() {
    selected = null; committed = false; setBusy(true); status('Loading backups...');
    const list = el('save-recovery-list'); list.replaceChildren();
    try {
      await config.ensureReady();
      const backups = await adapter().listBackups();
      for (const backup of backups) {
        const row = global.document.createElement('button');
        row.type = 'button'; row.className = 'save-backup-entry original-stone-button';
        row.setAttribute('aria-pressed', 'false');
        const date = backup.savedAt ? new Date(backup.savedAt).toLocaleString() : 'Before this update';
        label(row, date);
        row.addEventListener('click', () => {
          if (busy || committed) return;
          selected = backup.id;
          for (const button of list.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button === row));
          el('save-recovery-restore').disabled = false;
        });
        list.appendChild(row);
      }
      const notice = adapter().getRecoveryNotice?.();
      status(notice || (backups.length ? 'Restore saved progress for all players.' : 'No backups yet.'));
    } catch (error) {status(error.message || 'Backups could not be loaded. Keep this page open and try again.');}
    finally {setBusy(false);}
  }
  async function show() {
    if (!config) return;
    if (committed) {reload(); return;}
    config.closeMore?.();
    if (!dialog().open) dialog().showModal();
    label(el('save-recovery-title'), 'Restore Game');
    label(el('save-recovery-close'), acknowledge ? 'Continue Game' : 'Back');
    label(el('save-recovery-restore'), 'Restore');
    label(el('save-recovery-retry'), 'Reload Game');
    el('save-recovery-retry').hidden = true;
    await refresh();
  }
  function reload() {
    try {config.beforeReload(); config.reload();}
    catch (error) {
      status('The backup was restored safely. Reload this page to continue.');
      el('save-recovery-retry').hidden = false;
      el('save-recovery-retry').disabled = false;
    }
  }
  async function restore() {
    if (busy || committed || !selected) return;
    setBusy(true); status('Restoring saved progress...');
    try {
      await config.flush();
      await adapter().restoreBackup(selected);
      committed = true;
      // Stop old save timers before reload. The adapter also refuses any old-RAM write.
      status('Backup restored. Reloading game...');
      reload();
    } catch (error) {
      if (committed) {
        status('The backup was restored safely. Reload this page to continue.');
        el('save-recovery-retry').hidden = false;
      } else status((error.message || 'Restore failed.') + ' Your previous save is still kept.');
    } finally {setBusy(false);}
  }
  global.PVZSaveRecovery = Object.freeze({
    configure(value) {config = value;},
    open() {if (!config) return; return config.requestOpen ? config.requestOpen() : show();},
    show,
    isOpen: () => !!dialog()?.open,
    beforeNativeStart() {
      if (!config?.getAdapter()?.getRecoveryNotice?.()) return Promise.resolve();
      const promise = new Promise(resolve => {acknowledge = resolve;});
      void show(); return promise;
    },
  });
  el('save-recovery-close').addEventListener('click', close);
  el('save-recovery-restore').addEventListener('click', () => {void restore();});
  el('save-recovery-retry').addEventListener('click', reload);
  el('save-recovery-dialog').addEventListener('cancel', event => {
    event.preventDefault(); close();
  });
})(window);
