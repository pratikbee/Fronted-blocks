/**
 * Main App component
 */
import { useEffect, useState } from "react";
import { LogicDocument } from "./core/crdt/document";
import { Canvas } from "./ui/canvas/Canvas";
import { CategorizedPalette } from "./ui/palette/CategorizedPalette";
import { usePeerConnection } from "./ui/hooks/usePeerConnection";
import { useToast } from "./ui/hooks/useToast";
import { ToastContainer } from "./ui/components/Toast";
import { ConfirmDialog } from "./ui/components/ConfirmDialog";
import { registerAllBlocks } from "./core/blocks/definitions";
import "./App.css";

// Initialize block registry
registerAllBlocks();

function App() {
  const [document, setDocument] = useState<LogicDocument | null>(null);
  const [roomId] = useState(() => {
    // Generate or get room ID from URL
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || `room-${Math.random().toString(36).substr(2, 9)}`;
  });

  useEffect(() => {
    // Check if WebRTC should be disabled (for local testing without signaling servers)
    // Set ?webrtc=false in URL to disable WebRTC
    const params = new URLSearchParams(window.location.search);
    const enableWebRTC = params.get("webrtc") !== "false";

    // Initialize document
    const doc = new LogicDocument(roomId, true, enableWebRTC);
    setDocument(doc);

    // Update URL with room ID
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    window.history.replaceState({}, "", url.toString());

    // Cleanup on unmount
    return () => {
      doc.destroy();
    };
  }, [roomId]);

  if (!document) {
    return (
      <div className="app-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return <AppContent document={document} roomId={roomId} />;
}

function AppContent({ document, roomId }: { document: LogicDocument; roomId: string }) {
  const peerStatus = usePeerConnection(document);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toasts, removeToast, success } = useToast();
  const webrtcEnabled = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("webrtc") !== "false";
  })();

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    success(`Room ID copied: ${roomId}`);
    setShowShareMenu(false);
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    success("Room URL copied! Share this with others to collaborate.");
    setShowShareMenu(false);
  };

  const handleResetCanvas = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    document.clearAll();
    setShowResetConfirm(false);
    success("Canvas reset successfully");
  };

  return (
    <div className="app">
      <div className="app__header">
        <div className="app__title">Visual Logic Builder</div>
        <div className="app__status">
          <div className="app__room">
            <span>Room: {roomId}</span>
            <button className="app__share-button" onClick={() => setShowShareMenu(!showShareMenu)} title="Share room">
              📤 Share
            </button>
            <button className="app__reset-button" onClick={handleResetCanvas} title="Reset canvas">
              🔄 Reset
            </button>
            {showShareMenu && (
              <div className="app__share-menu">
                <button onClick={handleCopyRoomId}>📋 Copy Room ID</button>
                <button onClick={handleCopyUrl}>🔗 Copy Full URL</button>
                <div className="app__share-instructions">
                  <strong>To collaborate:</strong>
                  <ol>
                    <li>Copy the Room ID or URL</li>
                    <li>Share it with others</li>
                    <li>They open the same URL</li>
                    <li>Changes sync automatically!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          <div className={`app__connection ${peerStatus.connected ? "app__connection--connected" : ""}`}>
            {webrtcEnabled ? (
              <>
                {peerStatus.connected ? `🟢 Connected (${peerStatus.peerCount} peers)` : "🔴 Offline"}
                <button
                  className="app__webrtc-toggle"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("webrtc", "false");
                    window.location.href = url.toString();
                  }}
                  title="Disable WebRTC to stop connection errors"
                >
                  Disable WebRTC
                </button>
              </>
            ) : (
              <span style={{ color: "#999" }}>WebRTC Disabled (Local Only)</span>
            )}
          </div>
        </div>
      </div>
      <div className="app__body">
        <CategorizedPalette document={document} />
        <Canvas document={document} />
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Canvas"
        message="Are you sure you want to reset the canvas? This will delete all blocks and connections. This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}

export default App;
