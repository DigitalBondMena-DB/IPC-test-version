import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appVisibilityTrigger]',
  standalone: true
})
export class VisibilityTriggerDirective implements OnInit, OnDestroy {
  @Output() visible = new EventEmitter<void>();
  
  private observer: IntersectionObserver | null = null;
  private isVisible = false;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.isVisible = true;
          this.visible.emit();
        } else {
          this.isVisible = false;
        }
      },
      {
        root: null, // relative to document viewport
        threshold: 0.1, 
        rootMargin: '100px' // Trigger when target is 100px before appearing
      }
    );

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
