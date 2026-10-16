import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Google Chat Webhook Proxy Endpoint
  app.post('/api/google-chat-webhook', async (req: Request, res: Response) => {
    try {
      const { webhookUrl, text, threadKey } = req.body;

      if (!webhookUrl || typeof webhookUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Brak adresu URL webhooka Google Chat.' });
      }

      // Security check: only allow Google Chat webhook domains
      if (!webhookUrl.startsWith('https://chat.googleapis.com/')) {
        return res.status(400).json({
          success: false,
          error: 'Nieprawidłowy adres webhooka. Musi zaczynać się od https://chat.googleapis.com/',
        });
      }

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Brak treści wiadomości do wysłania.' });
      }

      const payload: Record<string, unknown> = { text };
      if (threadKey) {
        payload.thread = { threadKey };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Błąd Google Chat webhook:', response.status, errorText);
        return res.status(response.status).json({
          success: false,
          error: `Google Chat zwrócił błąd ${response.status}: ${errorText}`,
        });
      }

      const result = await response.json();
      return res.json({ success: true, result });
    } catch (err: unknown) {
      console.error('Błąd wysyłania do Google Chat:', err);
      const message = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', pwa: true });
  });

  if (!isProd) {
    // In dev mode: mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const isHmrEnabled = process.env.DISABLE_HMR !== 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrEnabled,
        watch: isHmrEnabled ? {} : null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod mode: serve dist static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer Czas Przerwy działa na porcie http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Błąd startu serwera:', err);
  process.exit(1);
});
