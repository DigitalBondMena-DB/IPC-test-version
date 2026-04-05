import { Component } from '@angular/core';

@Component({
  selector: 'app-main-footer',
  template: `
    <footer
      class="py-6 bg-[#F5F7FA] flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium"
    >
      <span>Powered by</span>
      <a href="https://www.digitalbondmena.com/" rel="noopener noreferrer" target="_blank">
        <img
          src="assets/images/shared/digital-bond-logo.webp"
          width="22"
          height="18"
          alt="Digital Bond"
        />
      </a>
      <span>Digital Bond</span>
    </footer>
  `,
})
export class MainFooterComponent {}
