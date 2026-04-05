import axios from 'axios';
import SiteConfig from '@/models/SiteConfig';

export async function sendDiscordWebhook(title: string, fields: { name: string, value: string, inline?: boolean }[], color: number = 0x00ff00) {
  try {
    const webhookConfig = await SiteConfig.findOne({ key: 'discordWebhookUrl' });
    if (!webhookConfig || !webhookConfig.value) return;

    const embed = {
      title,
      color,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: 'Robux Store System' }
    };

    await axios.post(webhookConfig.value, {
      embeds: [embed]
    });
  } catch (error) {
    console.error('Discord Webhook Error:', error);
  }
}
