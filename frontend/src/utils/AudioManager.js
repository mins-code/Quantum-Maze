/**
 * AudioManager - Singleton Audio Manager for Dynamic Soundtrack
 * 
 * Manages two audio tracks:
 * - baseTrack: Ambient/atmospheric background (constant volume)
 * - intenseTrack: High-energy beat (dynamic volume based on game intensity)
 */

class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }

        // Create audio elements
        this.baseTrack = new Audio();
        this.intenseTrack = new Audio();

        // State management
        this.isPlaying = false;
        this.isMuted = false;
        this.currentIntensity = 0;

        // Store the singleton instance
        AudioManager.instance = this;
    }

    /**
     * Load audio files and configure for looping
     * @param {string} basePath - Path to the base/ambient track
     * @param {string} intensePath - Path to the intense/beat track
     */
    load(basePath, intensePath) {
        // Set audio sources
        this.baseTrack.src = basePath;
        this.intenseTrack.src = intensePath;

        // Enable looping for both tracks
        this.baseTrack.loop = true;
        this.intenseTrack.loop = true;

        // Set initial volumes
        this.baseTrack.volume = 1.0; // Constant volume
        this.intenseTrack.volume = 0.0; // Starts silent

        // Preload the audio
        this.baseTrack.load();
        this.intenseTrack.load();

        console.log('[AudioManager] Audio tracks loaded:', { basePath, intensePath });
    }

    /**
     * Start playing both tracks simultaneously
     * Ensures tracks stay in sync
     */
    async play() {
        // If we are already fully playing, just return true
        if (this.isPlaying && !this.playPromise) {
            return true;
        }

        // If a play request is already in progress, join it
        if (this.playPromise) {
            console.log('[AudioManager] Joining existing play request');
            return this.playPromise;
        }

        this.isPlaying = true;

        // Create a new play promise that we can share
        this.playPromise = (async () => {
            try {
                // Start both tracks at the same time to keep them in sync
                await Promise.all([
                    this.baseTrack.play(),
                    this.intenseTrack.play()
                ]);

                // Check if we were stopped while waiting for the promise
                if (!this.isPlaying) {
                    this.baseTrack.pause();
                    this.intenseTrack.pause();
                    this.baseTrack.currentTime = 0;
                    this.intenseTrack.currentTime = 0;
                    return false;
                } else {
                    console.log('[AudioManager] Playback started');
                    return true;
                }
            } catch (error) {
                const isAbort = error.name === 'AbortError';

                // If the error is an abort/interrupt error from calling pause(), it's expected
                if (!isAbort) {
                    console.error('[AudioManager] Error starting playback:', error);
                }
                
                // Only reset flag if it wasn't an abort error
                if (!isAbort && this.isPlaying) {
                    this.isPlaying = false;
                }
                return false;
            } finally {
                // Clear the promise so future calls start fresh
                this.playPromise = null;
            }
        })();

        return this.playPromise;
    }

    /**
     * Stop and reset both tracks
     */
    stop() {
        // Always force stop, regardless of isPlaying flag, to handle race conditions
        this.isPlaying = false;

        // Pause both tracks
        this.baseTrack.pause();
        this.intenseTrack.pause();

        // Reset to beginning
        this.baseTrack.currentTime = 0;
        this.intenseTrack.currentTime = 0;

        console.log('[AudioManager] Playback stopped');
    }

    /**
     * Set the distance from goal (controls intense track playback)
     * @param {number} distance - Distance in steps from the goal
     */
    setDistanceFromGoal(distance) {
        const THRESHOLD = 5; // Play beat when 5 or fewer steps from goal
        
        // Only update if not muted
        if (!this.isMuted) {
            if (distance <= THRESHOLD) {
                // Close to goal - play the beat at full volume
                this.intenseTrack.volume = 1.0;
                console.log(`[AudioManager] Beat ON - ${distance} steps from goal`);
            } else {
                // Far from goal - silence the beat
                this.intenseTrack.volume = 0.0;
                console.log(`[AudioManager] Beat OFF - ${distance} steps from goal`);
            }
        }
        
        this.currentIntensity = distance <= THRESHOLD ? 1.0 : 0.0;
    }

    /**
     * Set the intensity level (controls intense track volume)
     * @param {number} value - Intensity value between 0.0 and 1.0
     * @deprecated Use setDistanceFromGoal instead
     */
    setIntensity(value) {
        // Clamp value between 0 and 1
        const clampedValue = Math.max(0, Math.min(1, value));
        
        this.currentIntensity = clampedValue;
        
        // Only update volume if not muted
        if (!this.isMuted) {
            this.intenseTrack.volume = clampedValue;
        }

        console.log(`[AudioManager] Intensity set to ${clampedValue.toFixed(2)}`);
    }

    /**
     * Toggle mute state for all audio
     * @returns {boolean} - New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            // Mute both tracks
            this.baseTrack.volume = 0;
            this.intenseTrack.volume = 0;
        } else {
            // Restore volumes
            this.baseTrack.volume = 1.0;
            this.intenseTrack.volume = this.currentIntensity;
        }

        console.log(`[AudioManager] Mute ${this.isMuted ? 'enabled' : 'disabled'}`);
        return this.isMuted;
    }

    /**
     * Get current playback state
     * @returns {Object} - Current state information
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            intensity: this.currentIntensity,
            baseVolume: this.baseTrack.volume,
            intenseVolume: this.intenseTrack.volume
        };
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.stop();
        this.baseTrack.src = '';
        this.intenseTrack.src = '';
        console.log('[AudioManager] Disposed');
    }
}

// Create and export the singleton instance
const audioManager = new AudioManager();
export default audioManager;
