/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BonusItem,
  BonusType,
  DifficultyLevel,
  FloatingText,
  GameState,
  Obstacle,
  Particle,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { DIFFICULTY_SETTINGS, GAME_ASSETS, PLAYER_IMAGE, BACKGROUND_IMAGE } from '../config/assets';

interface GameCanvasProps {
  gameState: GameState;
  difficulty: DifficultyLevel;
  onGameOver: (stats: { obstacleScore: number; bonusPoints: number; totalScore: number }) => void;
  onScoreUpdate: (stats: { obstacleScore: number; bonusPoints: number; totalScore: number }) => void;
  onPauseToggle: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const WORLD_WIDTH = 440;
const WORLD_HEIGHT = 700;
const GROUND_HEIGHT = 70;
const PLAYABLE_HEIGHT = WORLD_HEIGHT - GROUND_HEIGHT;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  difficulty,
  onGameOver,
  onScoreUpdate,
  onPauseToggle,
  isMuted,
  onMuteToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Loaded image references (from fixed developer assets)
  const characterImgRef = useRef<HTMLImageElement | null>(null);
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);

  // Player physics state
  const playerRef = useRef({
    x: 105,
    y: PLAYABLE_HEIGHT / 2 - 10,
    vy: 0,
    radius: 20,
    rotation: 0,
    flapWingCycle: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const bonusesRef = useRef<BonusItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  const scoreRef = useRef({
    obstacleScore: 0,
    bonusPoints: 0,
    bonusesCollected: 0,
  });

  const animFrameIdRef = useRef<number | null>(null);
  const nextObstacleIdRef = useRef<number>(1);
  const nextBonusIdRef = useRef<number>(1);
  const nextTextIdRef = useRef<number>(1);

  const screenShakeRef = useRef<number>(0);
  const backgroundScrollRef = useRef<number>(0);
  const groundScrollRef = useRef<number>(0);
  const hasGameOverTriggeredRef = useRef<boolean>(false);
  const isReadyFlapWaitingRef = useRef<boolean>(true);
  const gameStartTimeRef = useRef<number>(0);
  const lastFlapTimeRef = useRef<number>(0);

  // UI state for floating overlay HUD
  const [hudScores, setHudScores] = useState({
    obstacleScore: 0,
    bonusPoints: 0,
    totalScore: 0,
  });

  const diffConfig = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.easy;

  // Load developer-specified person PNG and custom background image
  useEffect(() => {
    const charSrc = PLAYER_IMAGE || GAME_ASSETS.characterImage;
    if (charSrc) {
      const img = new Image();
      img.onload = () => {
        characterImgRef.current = img;
      };
      img.src = charSrc;
    } else {
      characterImgRef.current = null;
    }

    const bgSrc = BACKGROUND_IMAGE || GAME_ASSETS.backgroundImage;
    if (bgSrc) {
      const bg = new Image();
      bg.onload = () => {
        backgroundImgRef.current = bg;
      };
      bg.src = bgSrc;
    } else {
      backgroundImgRef.current = null;
    }
  }, []);

  /**
   * Reset game objects for a fresh run
   */
  const resetGameObjects = useCallback(() => {
    playerRef.current = {
      x: 105,
      y: PLAYABLE_HEIGHT / 2 - 10,
      vy: 0,
      radius: 20,
      rotation: 0,
      flapWingCycle: 0,
    };
    obstaclesRef.current = [];
    bonusesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    scoreRef.current = {
      obstacleScore: 0,
      bonusPoints: 0,
      bonusesCollected: 0,
    };
    screenShakeRef.current = 0;
    hasGameOverTriggeredRef.current = false;
    isReadyFlapWaitingRef.current = true;
    gameStartTimeRef.current = 0;
    lastFlapTimeRef.current = 0;

    setHudScores({
      obstacleScore: 0,
      bonusPoints: 0,
      totalScore: 0,
    });
    onScoreUpdate({ obstacleScore: 0, bonusPoints: 0, totalScore: 0 });
  }, [onScoreUpdate]);

  /**
   * Flap / Fly impulse with debouncing to prevent double inputs
   */
  const flap = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const now = performance.now();
    // Prevent accidental double inputs within 110ms
    if (now - lastFlapTimeRef.current < 110) {
      return;
    }
    lastFlapTimeRef.current = now;

    if (isReadyFlapWaitingRef.current) {
      isReadyFlapWaitingRef.current = false;
      gameStartTimeRef.current = now;
    }

    // Gentle, smooth upward impulse based on difficulty
    playerRef.current.vy = diffConfig.flapStrength;
    soundEngine.playFlapSound();

    // Spawn tiny trail sparkles on flap
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: playerRef.current.x - 14,
        y: playerRef.current.y + (Math.random() * 10 - 5),
        vx: -(Math.random() * 1.5 + 1),
        vy: Math.random() * 1.5 - 0.75,
        size: Math.random() * 3 + 2,
        color: '#FDE047',
        alpha: 0.85,
        life: 0,
        maxLife: 18,
        shape: 'sparkle',
      });
    }
  }, [gameState, diffConfig.flapStrength]);

  // Handle inputs (Space bar, ArrowUp, W)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        flap();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        onPauseToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flap, onPauseToggle]);

  // Reset or adjust when gameState changes
  const prevGameStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    const prevState = prevGameStateRef.current;
    prevGameStateRef.current = gameState;

    if (gameState === 'PLAYING') {
      if (prevState === 'PAUSED') {
        soundEngine.resumeBGM();
      } else if (prevState !== 'PLAYING') {
        resetGameObjects();
        soundEngine.startBGM(true);
      }
    } else if (gameState === 'PAUSED') {
      soundEngine.pauseBGM();
    } else if (gameState === 'TITLE_MENU') {
      soundEngine.stopBGM();
      resetGameObjects();
    }
  }, [gameState, resetGameObjects]);

  // Spawn new obstacle pair with beginner-friendly gaps & spacing
  const spawnObstacle = useCallback(() => {
    const minHeight = 70;
    const currentScore = scoreRef.current.obstacleScore;

    // Beginner-friendly gap: extra large on first 3 obstacles
    let gap = diffConfig.gapSize;
    if (currentScore < 3) {
      gap += 20; // Extra generous opening for the first few seconds
    } else {
      // Gentle subtle reduction only after multiple obstacles
      const reduction = Math.min((currentScore - 3) * 0.4, 15);
      gap = Math.max(diffConfig.gapSize - reduction, 145);
    }

    const availableHeight = PLAYABLE_HEIGHT - gap - minHeight * 2;
    let topHeight: number;

    // First 3 obstacles are centered and predictable to make early game very easy
    if (currentScore < 3) {
      topHeight = minHeight + availableHeight * 0.4 + (Math.random() * 30 - 15);
    } else {
      topHeight = minHeight + Math.random() * Math.max(20, availableHeight);
    }

    const bottomY = topHeight + gap;
    const obstacleId = nextObstacleIdRef.current++;
    const obstacleX = WORLD_WIDTH + 50;

    // Spawn bonus item centered safely in the open gap
    let bonus: BonusItem | undefined = undefined;
    if (Math.random() < 0.85) {
      const types: BonusType[] = ['star', 'coin', 'heart', 'gem'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      bonus = {
        id: nextBonusIdRef.current++,
        x: obstacleX + 32, // Centered in the 64px obstacle column
        y: topHeight + gap / 2,
        radius: 13,
        type: chosenType,
        collected: false,
        value: 10,
        floatOffset: Math.random() * Math.PI * 2,
        rotation: 0,
      };
      bonusesRef.current.push(bonus);
    }

    obstaclesRef.current.push({
      id: obstacleId,
      x: obstacleX,
      width: 64,
      topHeight,
      bottomY,
      gap,
      passed: false,
      bonus,
    });
  }, [diffConfig.gapSize]);

  /**
   * Main Game Engine Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const rect = canvas.getBoundingClientRect();

      // Uniform aspect scaling:
      // Separate virtual game coordinate space (WORLD_WIDTH=440, WORLD_HEIGHT=700)
      // from physical screen dimensions with uniform scaling to prevent any stretching
      const scale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT);
      const targetW = Math.max(1, Math.round(WORLD_WIDTH * scale));
      const targetH = Math.max(1, Math.round(WORLD_HEIGHT * scale));

      const displayWidth = Math.round(targetW * dpr);
      const displayHeight = Math.round(targetH * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.save();
      ctx.scale(displayWidth / WORLD_WIDTH, displayHeight / WORLD_HEIGHT);

      // Handle subtle screen shake on game over impact
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() * 2 - 1) * screenShakeRef.current;
        const shakeY = (Math.random() * 2 - 1) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current *= 0.85;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // ----------------------------------------------------
      // 1. UPDATE LOGIC (Only when active PLAYING & not waiting)
      // ----------------------------------------------------
      const isActivelySimulating = gameState === 'PLAYING' && !isReadyFlapWaitingRef.current;

      // Obstacle speed calculation:
      // First 10 seconds or first 3 obstacles keep the calm base speed
      const passedCount = scoreRef.current.obstacleScore;
      let speedBonus = 0;
      if (passedCount > 3) {
        speedBonus = Math.min((passedCount - 3) * diffConfig.speedRampPerObstacle, diffConfig.maxSpeedBonus);
      }
      const speed = diffConfig.baseSpeed + speedBonus;

      if (isActivelySimulating) {
        // Player Physics: Reduced gravity and smooth descent
        const player = playerRef.current;
        player.vy += diffConfig.gravity;

        // Cap downward terminal fall velocity so character never drops abruptly
        if (player.vy > diffConfig.maxFallSpeed) {
          player.vy = diffConfig.maxFallSpeed;
        }

        player.y += player.vy;
        player.flapWingCycle += 0.12;

        // Smooth rotation based on vertical velocity (-0.35 rad up to 0.95 rad down)
        const targetRotation = Math.max(-0.35, Math.min(0.95, player.vy * 0.08));
        player.rotation += (targetRotation - player.rotation) * 0.18;

        // Emit subtle flight trail particles
        if (Math.random() < 0.5) {
          particlesRef.current.push({
            x: player.x - 16,
            y: player.y + 4,
            vx: -speed * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            size: Math.random() * 3.5 + 2,
            color: 'rgba(255, 255, 255, 0.6)',
            alpha: 0.65,
            life: 0,
            maxLife: 22,
            shape: 'circle',
          });
        }

        // Spawn obstacles with sufficient spacing
        const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
        if (!lastObstacle || lastObstacle.x < WORLD_WIDTH - diffConfig.obstacleDistance) {
          spawnObstacle();
        }

        // Move obstacles & detect passing score
        obstaclesRef.current.forEach((obs) => {
          obs.x -= speed;

          // Score when player safely crosses the obstacle center
          if (!obs.passed && obs.x + obs.width / 2 < player.x) {
            obs.passed = true;
            scoreRef.current.obstacleScore += 1;
            const newTotal = scoreRef.current.obstacleScore * 10 + scoreRef.current.bonusPoints;

            setHudScores({
              obstacleScore: scoreRef.current.obstacleScore,
              bonusPoints: scoreRef.current.bonusPoints,
              totalScore: newTotal,
            });
            onScoreUpdate({
              obstacleScore: scoreRef.current.obstacleScore,
              bonusPoints: scoreRef.current.bonusPoints,
              totalScore: newTotal,
            });
          }
        });

        // Remove off-screen obstacles
        obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x + obs.width > -50);

        // Update bonuses & check collection
        bonusesRef.current.forEach((bonus) => {
          bonus.x -= speed;
          bonus.rotation += 0.025;
          bonus.floatOffset += 0.035;

          if (!bonus.collected) {
            // Collision detection with player
            const dx = player.x - bonus.x;
            const dy = player.y - (bonus.y + Math.sin(bonus.floatOffset) * 5);
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Generous collection radius
            if (dist < player.radius + bonus.radius + 4) {
              bonus.collected = true;
              scoreRef.current.bonusPoints += bonus.value;
              scoreRef.current.bonusesCollected += 1;

              const newTotal = scoreRef.current.obstacleScore * 10 + scoreRef.current.bonusPoints;
              setHudScores({
                obstacleScore: scoreRef.current.obstacleScore,
                bonusPoints: scoreRef.current.bonusPoints,
                totalScore: newTotal,
              });
              onScoreUpdate({
                obstacleScore: scoreRef.current.obstacleScore,
                bonusPoints: scoreRef.current.bonusPoints,
                totalScore: newTotal,
              });

              // Play custom bonus sound or synth chime
              soundEngine.playBonusSound();

              // Spawn floating "+10" score text
              floatingTextsRef.current.push({
                id: nextTextIdRef.current++,
                text: `+${bonus.value}`,
                x: bonus.x,
                y: bonus.y,
                alpha: 1.0,
                color: '#FDE047',
              });

              // Spawn burst of golden sparkles
              for (let p = 0; p < 12; p++) {
                const angle = (p / 12) * Math.PI * 2;
                const pSpeed = Math.random() * 2.5 + 1.8;
                particlesRef.current.push({
                  x: bonus.x,
                  y: bonus.y,
                  vx: Math.cos(angle) * pSpeed,
                  vy: Math.sin(angle) * pSpeed,
                  size: Math.random() * 4 + 2.5,
                  color: bonus.type === 'heart' ? '#FB7185' : '#FBBF24',
                  alpha: 1.0,
                  life: 0,
                  maxLife: 24,
                  shape: bonus.type === 'heart' ? 'heart' : 'sparkle',
                });
              }
            }
          }
        });

        // Filter out offscreen bonuses
        bonusesRef.current = bonusesRef.current.filter((b) => b.x > -50 && !b.collected);

        // Update background & ground parallax offset
        backgroundScrollRef.current = (backgroundScrollRef.current + speed * 0.25) % WORLD_WIDTH;
        groundScrollRef.current = (groundScrollRef.current + speed) % 40;

        // Check Collisions (Pipes, Ground, Ceiling)
        // Highly forgiving hitbox: collision radius scaled by diffConfig.hitboxRatio (e.g. 65% on Easy!)
        const hitRadius = player.radius * diffConfig.hitboxRatio;

        const hitCeiling = player.y - hitRadius < 0;
        const hitGround = player.y + hitRadius >= PLAYABLE_HEIGHT;

        let hitPipe = false;

        for (const obs of obstaclesRef.current) {
          // Top pipe collision
          const closestX = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
          const topClosestY = Math.max(0, Math.min(player.y, obs.topHeight));
          const topDistX = player.x - closestX;
          const topDistY = player.y - topClosestY;
          if (topDistX * topDistX + topDistY * topDistY < hitRadius * hitRadius) {
            hitPipe = true;
            break;
          }

          // Bottom pipe collision
          const bottomClosestY = Math.max(obs.bottomY, Math.min(player.y, PLAYABLE_HEIGHT));
          const botDistX = player.x - closestX;
          const botDistY = player.y - bottomClosestY;
          if (botDistX * botDistX + botDistY * botDistY < hitRadius * hitRadius) {
            hitPipe = true;
            break;
          }
        }

        if ((hitCeiling || hitGround || hitPipe) && !hasGameOverTriggeredRef.current) {
          hasGameOverTriggeredRef.current = true;
          screenShakeRef.current = 10;

          // Crash particles
          for (let i = 0; i < 16; i++) {
            particlesRef.current.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              size: Math.random() * 5 + 2,
              color: '#EF4444',
              alpha: 1.0,
              life: 0,
              maxLife: 28,
              shape: 'circle',
            });
          }

          soundEngine.stopBGM();
          soundEngine.playGameOverSound();

          const total = scoreRef.current.obstacleScore * 10 + scoreRef.current.bonusPoints;
          onGameOver({
            obstacleScore: scoreRef.current.obstacleScore,
            bonusPoints: scoreRef.current.bonusPoints,
            totalScore: total,
          });
        }
      } else if (isReadyFlapWaitingRef.current && gameState === 'PLAYING') {
        // Idle gentle floating bobbing before first flap
        const t = performance.now() * 0.003;
        playerRef.current.y = PLAYABLE_HEIGHT / 2 - 10 + Math.sin(t) * 8;
        playerRef.current.rotation = Math.sin(t) * 0.05;
      }

      // Update Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // Update Floating Texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y -= 1.2;
        ft.alpha -= 0.022;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      // ----------------------------------------------------
      // 2. RENDER STAGE
      // ----------------------------------------------------

      // A. Background (Custom Background Image - 100% Stationary)
      if (backgroundImgRef.current && backgroundImgRef.current.complete) {
        const bgImg = backgroundImgRef.current;
        const naturalW = bgImg.naturalWidth || bgImg.width || 800;
        const naturalH = bgImg.naturalHeight || bgImg.height || 600;

        // Cover-style scaling across the entire game environment without distortion
        const scale = Math.max(WORLD_WIDTH / naturalW, WORLD_HEIGHT / naturalH);
        const drawWidth = naturalW * scale;
        const drawHeight = naturalH * scale;

        // Completely stationary & centered - ZERO scrolling, zero translation, zero shifting
        const offsetX = (WORLD_WIDTH - drawWidth) / 2;
        const offsetY = (WORLD_HEIGHT - drawHeight) / 2;

        ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);

        // Soft contrast scrim so obstacles, character and bonus collectibles pop vibrantly
        const scrim = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
        scrim.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
        scrim.addColorStop(0.5, 'rgba(15, 23, 42, 0.08)');
        scrim.addColorStop(1, 'rgba(15, 23, 42, 0.25)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      } else {
        // Procedural Parallax Sky Background
        const grad = ctx.createLinearGradient(0, 0, 0, PLAYABLE_HEIGHT);
        grad.addColorStop(0, '#38BDF8');
        grad.addColorStop(0.55, '#7DD3FC');
        grad.addColorStop(1, '#BAE6FD');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WORLD_WIDTH, PLAYABLE_HEIGHT);

        // Distant Sun
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(WORLD_WIDTH * 0.75, 110, 46, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(WORLD_WIDTH * 0.75, 110, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Parallax Mountain Silhouettes
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.moveTo(0, PLAYABLE_HEIGHT);
        const mtnOffset = (backgroundScrollRef.current * 0.4) % 300;
        for (let x = -300; x < WORLD_WIDTH + 300; x += 150) {
          const peakX = x - mtnOffset + 75;
          const peakY = PLAYABLE_HEIGHT - 120 - Math.sin(x) * 40;
          ctx.lineTo(peakX, peakY);
          ctx.lineTo(x - mtnOffset + 150, PLAYABLE_HEIGHT);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Stylized Clouds
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const cloudOffset = (backgroundScrollRef.current * 0.7) % 360;
        const drawCloud = (cx: number, cy: number, scale: number) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 20 * scale, cy - 8 * scale, 24 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 44 * scale, cy, 18 * scale, 0, Math.PI * 2);
          ctx.fill();
        };
        drawCloud(100 - cloudOffset, 150, 1.2);
        drawCloud(460 - cloudOffset, 150, 1.2);
        drawCloud(280 - (cloudOffset * 1.2) % 400, 240, 0.9);
        drawCloud(680 - (cloudOffset * 1.2) % 400, 240, 0.9);
        ctx.restore();
      }

      // B. Obstacles (Floating Pillars / Crystal Pipes)
      obstaclesRef.current.forEach((obs) => {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        topGrad.addColorStop(0, '#10B981');
        topGrad.addColorStop(0.35, '#34D399');
        topGrad.addColorStop(0.85, '#10B981');
        topGrad.addColorStop(1, '#064E3B');

        ctx.fillStyle = topGrad;
        ctx.strokeStyle = '#022C22';
        ctx.lineWidth = 2.5;

        // Pipe stem
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
        ctx.strokeRect(obs.x, 0, obs.width, obs.topHeight);

        // Pipe lip / cap
        const lipHeight = 22;
        const lipOverhang = 6;
        ctx.fillRect(
          obs.x - lipOverhang,
          obs.topHeight - lipHeight,
          obs.width + lipOverhang * 2,
          lipHeight
        );
        ctx.strokeRect(
          obs.x - lipOverhang,
          obs.topHeight - lipHeight,
          obs.width + lipOverhang * 2,
          lipHeight
        );

        // Bottom Pipe
        const bottomHeight = PLAYABLE_HEIGHT - obs.bottomY;
        ctx.fillRect(obs.x, obs.bottomY, obs.width, bottomHeight);
        ctx.strokeRect(obs.x, obs.bottomY, obs.width, bottomHeight);

        // Bottom pipe lip / cap
        ctx.fillRect(
          obs.x - lipOverhang,
          obs.bottomY,
          obs.width + lipOverhang * 2,
          lipHeight
        );
        ctx.strokeRect(
          obs.x - lipOverhang,
          obs.bottomY,
          obs.width + lipOverhang * 2,
          lipHeight
        );
      });

      // C. Collectible Bonuses (Stars, Hearts, Coins, Gems)
      bonusesRef.current.forEach((bonus) => {
        if (bonus.collected) return;

        const bobY = bonus.y + Math.sin(bonus.floatOffset) * 5;

        ctx.save();
        ctx.translate(bonus.x, bobY);
        ctx.rotate(Math.sin(bonus.floatOffset * 0.8) * 0.18);

        // Soft Halo glow
        ctx.beginPath();
        ctx.arc(0, 0, bonus.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle =
          bonus.type === 'heart'
            ? 'rgba(244, 63, 94, 0.35)'
            : bonus.type === 'gem'
            ? 'rgba(6, 182, 212, 0.35)'
            : 'rgba(251, 191, 36, 0.4)';
        ctx.fill();

        if (bonus.type === 'star') {
          // Draw 5-point star
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const spikes = 5;
          const outerR = bonus.radius;
          const innerR = bonus.radius * 0.48;
          for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const sx = Math.cos(angle) * r;
            const sy = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (bonus.type === 'heart') {
          // Draw heart
          ctx.fillStyle = '#F43F5E';
          ctx.strokeStyle = '#FFE4E6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const d = bonus.radius;
          ctx.moveTo(0, d * 0.3);
          ctx.bezierCurveTo(-d * 0.8, -d * 0.6, -d * 1.2, d * 0.3, 0, d);
          ctx.bezierCurveTo(d * 1.2, d * 0.3, d * 0.8, -d * 0.6, 0, d * 0.3);
          ctx.fill();
          ctx.stroke();
        } else if (bonus.type === 'gem') {
          // Draw diamond gem
          ctx.fillStyle = '#06B6D4';
          ctx.strokeStyle = '#CFFAFE';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -bonus.radius);
          ctx.lineTo(bonus.radius, 0);
          ctx.lineTo(0, bonus.radius);
          ctx.lineTo(-bonus.radius, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Gold Coin
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#FEF3C7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, bonus.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, bonus.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = '#D97706';
          ctx.stroke();
        }

        ctx.restore();
      });

      // D. Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // E. Draw Flying Character
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.rotation);

      if (characterImgRef.current && characterImgRef.current.complete) {
        const img = characterImgRef.current;
        const naturalW = img.naturalWidth || img.width || 100;
        const naturalH = img.naturalHeight || img.height || 100;
        const aspect = naturalW / naturalH;

        // Increased size for prominent, clear visibility while strictly preserving natural PNG shape & aspect ratio
        const targetHeight = 105;
        const targetWidth = targetHeight * aspect;

        // Subtle floating / flying motion
        const floatY = Math.sin(player.flapWingCycle * 1.5) * 2.5;

        ctx.save();
        ctx.translate(0, floatY);

        // Soft drop shadow following the exact transparent silhouette of the PNG
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;

        // Draw the PNG as it is - NO circular crop, NO border, 100% natural transparent silhouette
        ctx.drawImage(
          img,
          -targetWidth / 2,
          -targetHeight / 2,
          targetWidth,
          targetHeight
        );

        ctx.restore();
      } else {
        // Fallback placeholder while image is initializing
        const r = player.radius;
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // F. Ground Layer
      const groundGrad = ctx.createLinearGradient(0, PLAYABLE_HEIGHT, 0, WORLD_HEIGHT);
      groundGrad.addColorStop(0, '#15803D');
      groundGrad.addColorStop(0.15, '#16A34A');
      groundGrad.addColorStop(0.2, '#78350F');
      groundGrad.addColorStop(1, '#451A03');

      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, PLAYABLE_HEIGHT, WORLD_WIDTH, GROUND_HEIGHT);

      // Top grass line
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(0, PLAYABLE_HEIGHT, WORLD_WIDTH, 4);

      // Scrolling ground detail stripes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      const gOffset = groundScrollRef.current;
      for (let x = -gOffset; x < WORLD_WIDTH; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, PLAYABLE_HEIGHT + 6);
        ctx.lineTo(x + 18, PLAYABLE_HEIGHT + GROUND_HEIGHT);
        ctx.lineTo(x + 24, PLAYABLE_HEIGHT + GROUND_HEIGHT);
        ctx.lineTo(x + 6, PLAYABLE_HEIGHT + 6);
        ctx.closePath();
        ctx.fill();
      }

      // G. Floating Score Popups (+10)
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // H. Ready / Tap to Fly Indicator
      if (gameState === 'PLAYING' && isReadyFlapWaitingRef.current) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.roundRect(WORLD_WIDTH / 2 - 120, PLAYABLE_HEIGHT / 2 + 50, 240, 54, 14);
        ctx.fill();

        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 17px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TAP OR PRESS SPACE', WORLD_WIDTH / 2, PLAYABLE_HEIGHT / 2 + 82);
        ctx.restore();
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [
    gameState,
    diffConfig,
    onGameOver,
    onScoreUpdate,
    spawnObstacle,
  ]);

  // Touch & Pointer Handlers with preventDefault to eliminate double-firing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only primary button
    if (e.button === 0) {
      flap();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    flap();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center select-none overflow-hidden bg-slate-950">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        className="w-full h-full cursor-pointer touch-none block"
      />

      {/* Floating In-Game HUD */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          {/* Score Counter */}
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
            {/* Obstacles passed */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Obstacles
              </span>
              <span className="text-lg font-bold font-display text-white tabular-nums leading-tight">
                {hudScores.obstacleScore}
              </span>
            </div>

            <div className="h-6 w-px bg-white/15" />

            {/* Bonus Points */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                Bonus Pts
              </span>
              <span className="text-lg font-bold font-display text-amber-300 tabular-nums leading-tight">
                +{hudScores.bonusPoints}
              </span>
            </div>

            <div className="h-6 w-px bg-white/15" />

            {/* Total Points */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-lg font-extrabold font-display text-emerald-300 tabular-nums leading-tight">
                {hudScores.totalScore}
              </span>
            </div>
          </div>

          {/* Quick HUD Action Buttons (Pause & Audio Mute) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onMuteToggle}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-white/10 backdrop-blur-md transition-all shadow-md active:scale-95"
            >
              {isMuted ? (
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <button
              onClick={onPauseToggle}
              aria-label="Pause game"
              className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-white/10 backdrop-blur-md transition-all shadow-md active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
