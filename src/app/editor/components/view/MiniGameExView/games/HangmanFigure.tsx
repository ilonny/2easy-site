"use client";

import { FC } from "react";
import styles from "../styles.module.css";

type TProps = {
  wrong: number;
  maxWrong?: number;
};

/**
 * Wordwall-style hangman: scaffold always visible, figure parts appear
 * one per wrong guess (6 lives → head, body, L-arm, R-arm, L-leg, R-leg).
 */
export const HangmanFigure: FC<TProps> = ({ wrong, maxWrong = 6 }) => {
  const w = Math.min(Math.max(0, wrong), maxWrong);
  const livesLeft = Math.max(0, maxWrong - w);
  const lost = w >= maxWrong;

  return (
    <div className={styles.hangmanFigureWrap} aria-hidden>
      <svg
        className={styles.hangmanFigureSvg}
        viewBox="0 0 200 240"
        role="img"
        aria-label={`Виселица: ошибок ${w} из ${maxWrong}`}
      >
        {/* scaffold — always on */}
        <line
          x1="24"
          y1="220"
          x2="176"
          y2="220"
          className={styles.hangmanStrokeMuted}
        />
        <line
          x1="48"
          y1="220"
          x2="92"
          y2="220"
          className={styles.hangmanStroke}
        />
        <line
          x1="70"
          y1="220"
          x2="70"
          y2="28"
          className={styles.hangmanStroke}
        />
        <line
          x1="70"
          y1="28"
          x2="142"
          y2="28"
          className={styles.hangmanStroke}
        />
        <line
          x1="142"
          y1="28"
          x2="142"
          y2="52"
          className={styles.hangmanStroke}
        />

        {/* 1 — head */}
        <circle
          cx="142"
          cy="70"
          r="18"
          fill="none"
          className={w >= 1 ? styles.hangmanStroke : styles.hangmanStrokeGhost}
        />

        {/* 2 — body */}
        <line
          x1="142"
          y1="88"
          x2="142"
          y2="148"
          className={w >= 2 ? styles.hangmanStroke : styles.hangmanStrokeGhost}
        />

        {/* 3 — left arm */}
        <line
          x1="142"
          y1="104"
          x2="116"
          y2="130"
          className={w >= 3 ? styles.hangmanStroke : styles.hangmanStrokeGhost}
        />

        {/* 4 — right arm */}
        <line
          x1="142"
          y1="104"
          x2="168"
          y2="130"
          className={w >= 4 ? styles.hangmanStroke : styles.hangmanStrokeGhost}
        />

        {/* 5 — left leg */}
        <line
          x1="142"
          y1="148"
          x2="120"
          y2="186"
          className={
            w >= 5
              ? lost
                ? styles.hangmanStrokeDead
                : styles.hangmanStroke
              : styles.hangmanStrokeGhost
          }
        />

        {/* 6 — right leg */}
        <line
          x1="142"
          y1="148"
          x2="164"
          y2="186"
          className={
            w >= 6
              ? styles.hangmanStrokeDead
              : styles.hangmanStrokeGhost
          }
        />

        {lost && (
          <g className={styles.hangmanStrokeDead}>
            <line x1="134" y1="64" x2="140" y2="70" strokeWidth={2.5} />
            <line x1="140" y1="64" x2="134" y2="70" strokeWidth={2.5} />
            <line x1="144" y1="64" x2="150" y2="70" strokeWidth={2.5} />
            <line x1="150" y1="64" x2="144" y2="70" strokeWidth={2.5} />
          </g>
        )}
      </svg>

      <div className={styles.hangmanLives}>
        {Array.from({ length: maxWrong }).map((_, i) => (
          <span
            key={i}
            className={`${styles.hangmanLifeDot} ${
              i < livesLeft ? styles.hangmanLifeDotOn : styles.hangmanLifeDotOff
            }`}
          />
        ))}
        <span className={styles.hangmanLivesText}>
          Осталось попыток: {livesLeft}
        </span>
      </div>
    </div>
  );
};
