import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly LIGHT_THEME = 'light';
  private readonly DARK_THEME = 'dark';

  constructor() {
    // Inizializza il tema all'avvio
    this.getCurrentTheme();
  }

  /**
   * Ottiene il tema corrente dal localStorage o dalle preferenze di sistema
   * @returns Il tema corrente ('light' o 'dark')
   */
  getCurrentTheme(): string {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    if (savedTheme) {
      this.applyTheme(savedTheme);
      return savedTheme;
    }

    // Se non c'è un tema salvato, usa le preferenze di sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? this.DARK_THEME : this.LIGHT_THEME;
    this.applyTheme(theme);
    return theme;
  }

  /**
   * Imposta il tema
   * @param theme Il tema da applicare ('light' o 'dark')
   */
  setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Applica il tema al body
   * @param theme Il tema da applicare
   */
  private applyTheme(theme: string): void {
    const body = document.body;
    
    if (theme === this.LIGHT_THEME) {
      body.classList.add('light');
    } else {
      body.classList.remove('light');
    }
  }

  /**
   * Alterna tra tema chiaro e scuro
   */
  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.LIGHT_THEME ? this.DARK_THEME : this.LIGHT_THEME;
    this.setTheme(newTheme);
  }

  /**
   * Verifica se il tema corrente è chiaro
   * @returns true se il tema è chiaro, false altrimenti
   */
  isLightTheme(): boolean {
    return document.body.classList.contains('light');
  }
}

