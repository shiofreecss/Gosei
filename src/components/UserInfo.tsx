import React from 'react';
import './UserInfo.css';

interface UserInfoProps {
  blackPlayer: {
    name: string;
    handicap?: number;
    imageUrl?: string;
  };
  whitePlayer: {
    name: string;
    imageUrl?: string;
  };
  countdownTime?: number; // in seconds
}

const UserInfo: React.FC<UserInfoProps> = ({ blackPlayer, whitePlayer, countdownTime }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="user-info-container">
      <div className="player-info black-player">
        <div className="stone-icon black"></div>
        {blackPlayer.imageUrl && (
          <div className="player-image">
            <img src={blackPlayer.imageUrl} alt={`${blackPlayer.name}`} />
          </div>
        )}
        <div className="player-details">
          <span className="player-name">{blackPlayer.name}</span>
          {blackPlayer.handicap && blackPlayer.handicap > 0 && (
            <span className="handicap-info">(H{blackPlayer.handicap})</span>
          )}
        </div>
      </div>

      {countdownTime !== undefined && (
        <div className="countdown-timer">
          {formatTime(countdownTime)}
        </div>
      )}

      <div className="player-info white-player">
        <div className="stone-icon white"></div>
        {whitePlayer.imageUrl && (
          <div className="player-image">
            <img src={whitePlayer.imageUrl} alt={`${whitePlayer.name}`} />
          </div>
        )}
        <div className="player-details">
          <span className="player-name">{whitePlayer.name}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo; 