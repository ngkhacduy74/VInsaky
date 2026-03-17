import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from 'src/services/mail.service';

@Processor('email_queue_bull')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: MailService) {
    super();
  }
  async process(job: Job): Promise<any> {
    const { to, subject, html, type } = job.data;
    console.log('📩 Job name:', job.name);
    console.log('📩 Job descrip:', job);

    if (job.name === 'send-email') {
      await this.emailService.sendMail(to, subject, html, type);
    }
  }
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`✅ Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.log(`❌ Job failed: ${job.id}`, err.message);
  }
}
