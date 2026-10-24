import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSyncKey,
  selectSyncStatus,
  selectLastSyncTime,
  connectAndSync,
  manualSync,
  disconnectSync,
  showToastNotification
} from '../store/progressSlice';
import { sanitizeKey } from '../utils/codec';

export default function CloudSync() {
  const dispatch = useDispatch();
  const syncKey = useSelector(selectSyncKey);
  const syncStatus = useSelector(selectSyncStatus);
  const lastSyncTime = useSelector(selectLastSyncTime);

  const [inputVal, setInputVal] = useState(syncKey || '');

  useEffect(() => {
    if (syncKey) setInputVal(syncKey);
  }, [syncKey]);

  // Initial auto-connect if syncKey present in URL or localStorage
  useEffect(() => {
    if (syncKey) {
      dispatch(connectAndSync({ key: syncKey, isSilent: true }));
    }
  }, []);

  const handleConnect = (e) => {
    e.preventDefault();
    const clean = sanitizeKey(inputVal);
    if (!clean) {
      dispatch(showToastNotification('⚠️ Please enter a sync key'));
      return;
    }
    dispatch(connectAndSync({ key: clean, isSilent: false }));
  };

  const handleCopyLink = () => {
    const keyToUse = syncKey || sanitizeKey(inputVal);
    if (!keyToUse) {
      dispatch(showToastNotification('⚠️ Please enter a sync key first!'));
      return;
    }
    const base = window.location.origin + window.location.pathname;
    const shareUrl = `${base}#sync=${encodeURIComponent(keyToUse)}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        dispatch(showToastNotification('📋 Mobile link copied! Open on your phone to sync automatically.'));
      }).catch(() => {
        prompt('Copy this link to open on your phone:', shareUrl);
      });
    } else {
      prompt('Copy this link to open on your phone:', shareUrl);
    }
  };

  // Render status badge
  const renderStatus = () => {
    if (!syncKey || syncStatus === 'idle') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-paper-surface-2 text-paper-dim">
          <span className="w-2 h-2 rounded-full bg-paper-dim"></span>
          Local only
        </span>
      );
    }
    if (syncStatus === 'syncing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-gold-bg text-gold">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
          Syncing...
        </span>
      );
    }
    if (syncStatus === 'synced') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-sage-bg text-sage">
          <span className="w-2 h-2 rounded-full bg-sage"></span>
          Live Synced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-core-bg text-core">
        <span className="w-2 h-2 rounded-full bg-core"></span>
        Sync Failed
      </span>
    );
  };

  return (
    <div className="bg-paper-surface border border-paper-border rounded-xl p-4 sm:p-5 my-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2 font-serif text-base sm:text-lg font-semibold text-paper-text">
          <svg className="w-5 h-5 text-core" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <path d="M12 13v6m-3-3l3 3 3-3" />
          </svg>
          <span>Cross-Device Cloud Sync</span>
        </div>
        {renderStatus()}
      </div>

      <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter custom Sync Key (e.g. manav-dsa)"
          className="font-mono text-xs sm:text-sm px-3.5 py-2 border border-paper-border rounded-lg bg-paper-bg text-paper-text outline-none focus:border-core flex-1 max-w-sm transition-colors"
          spellCheck="false"
          autoComplete="off"
        />

        <button
          type="submit"
          className={`font-mono text-xs font-semibold px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            syncKey ? 'bg-paper-surface-2 border-paper-border hover:bg-paper-border' : 'bg-core border-core text-white hover:opacity-90'
          }`}
        >
          {syncKey ? 'Change Key' : 'Connect & Sync'}
        </button>

        {syncKey && (
          <button
            type="button"
            onClick={() => dispatch(manualSync())}
            className="font-mono text-xs font-semibold px-3.5 py-2 rounded-lg border border-paper-border bg-paper-surface-2 hover:bg-paper-border text-paper-text transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          >
            🔄 Sync Now
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyLink}
          className="font-mono text-xs font-semibold px-3.5 py-2 rounded-lg border border-paper-border bg-paper-surface-2 hover:bg-paper-border text-paper-text transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          title="Copy shareable link for mobile"
        >
          📋 Copy Mobile Link
        </button>

        {syncKey && (
          <button
            type="button"
            onClick={() => dispatch(disconnectSync())}
            className="font-mono text-xs font-semibold px-3 py-2 rounded-lg border border-paper-border bg-paper-surface-2 hover:bg-paper-border text-paper-dim hover:text-core transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            title="Disconnect sync"
          >
            Disconnect
          </button>
        )}
      </form>

      <div className="flex flex-col sm:flex-row justify-between text-xs text-paper-dim mt-2.5 gap-1.5">
        <span>💡 Enter the same key on phone or laptop. Every question you tick auto-syncs live!</span>
        {lastSyncTime && <span className="font-mono text-paper-faint">Synced at {lastSyncTime}</span>}
      </div>
    </div>
  );
}
