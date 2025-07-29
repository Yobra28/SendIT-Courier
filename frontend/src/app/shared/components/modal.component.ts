import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="close.emit()">&times;</button>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(30, 41, 59, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: modalFadeIn 0.25s;
    }
    .modal-content {
      background: #fff;
      border-radius: 18px;
      padding: 2.5rem 2rem 2rem 2rem;
      min-width: 340px;
      max-width: 95vw;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 8px 32px rgba(30,41,59,0.18), 0 1.5px 8px rgba(0,0,0,0.08);
      border: 1.5px solid #e0e7ef;
      animation: modalPopIn 0.25s;
      transition: box-shadow 0.2s, border 0.2s;
    }

    /* Mobile responsive modal */
    @media (max-width: 768px) {
      .modal-backdrop {
        padding: 1rem;
        align-items: flex-start;
        padding-top: 2rem;
      }
      
      .modal-content {
        min-width: auto;
        width: 100%;
        max-width: none;
        max-height: calc(100vh - 4rem);
        padding: 1.5rem;
        border-radius: 12px;
        margin: 0;
      }
      
      .modal-close {
        top: 0.75rem;
        right: 0.75rem;
        width: 2rem;
        height: 2rem;
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .modal-backdrop {
        padding: 0.5rem;
        padding-top: 1rem;
      }
      
      .modal-content {
        padding: 1rem;
        border-radius: 8px;
        max-height: calc(100vh - 2rem);
      }
    }
    .modal-content:focus {
      outline: none;
      box-shadow: 0 0 0 2px #6366f1;
      border-color: #6366f1;
    }
    .modal-close {
      position: absolute;
      top: 1.1rem;
      right: 1.1rem;
      background: #f3f4f6;
      border: none;
      font-size: 2.1rem;
      color: #64748b;
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      transition: background 0.15s, color 0.15s;
    }
    .modal-close:hover {
      background: #e0e7ef;
      color: #1e293b;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalPopIn {
      from { opacity: 0; transform: scale(0.97) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class ModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }
} 