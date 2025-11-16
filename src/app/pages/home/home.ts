import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Sidebar, Topbar],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
}
