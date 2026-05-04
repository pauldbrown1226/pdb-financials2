import { Component, signal, input, OnInit, inject, effect, computed, ChangeDetectionStrategy, Input } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonAppearance } from '@angular/material/button';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [MatToolbarModule, MatButtonToggleModule ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {

  alertMessage: string;

  
  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('in header ngOnInit: ');
    // this.editMessage = 'dummy edit message in headerComponent.ts';

  }

  handleNavigation(lnk: string) {
    console.log(lnk);

    this.router.navigate([lnk]);
  }

  
}
