import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MessageConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-dynamic-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-container" [ngClass]="'message-' + config.type" *ngIf="isVisible">
      <div class="message-icon">
        <span class="material-icons">{{ getIcon() }}</span>
      </div>
      <div class="message-content">
        <h4>{{ config.title }}</h4>
        <p>{{ config.message }}</p>
      </div>
      <button class="message-close" (click)="close()">
        <span class="material-icons">close</span>
      </button>
    </div>
  `,
  styles: [`
    .message-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-success {
      background: var(--success-50);
      border: 1px solid var(--success-200);
      color: var(--success-800);
    }

    .message-error {
      background: var(--error-50);
      border: 1px solid var(--error-200);
      color: var(--error-800);
    }

    .message-warning {
      background: var(--warning-50);
      border: 1px solid var(--warning-200);
      color: var(--warning-800);
    }

    .message-info {
      background: var(--info-50);
      border: 1px solid var(--info-200);
      color: var(--info-800);
    }

    .message-icon {
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
    }

    .message-content h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .message-content p {
      margin: 0;
      font-size: 0.875rem;
    }

    .message-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .message-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class DynamicMessageComponent {
  @Input() config!: MessageConfig;
  isVisible = true;

  ngOnInit(): void {
    if (this.config.duration) {
      setTimeout(() => {
        this.close();
      }, this.config.duration);
    }
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  close(): void {
    this.isVisible = false;
  }
}