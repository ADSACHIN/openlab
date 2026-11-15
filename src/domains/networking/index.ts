import { defineModule } from '@core/model';
import { handshakeLab } from './labs/handshake-lab';
import { subnetLab } from './labs/subnet-lab';
import {
  dnsResolution,
  ipAddressing,
  osiModel,
  packetJourney,
  tcpHandshakeLesson,
  tlsHandshakeLesson,
} from './lessons';
import { simulators } from './simulators';

export const networkingModule = defineModule({
  id: 'networking',
  lessons: [
    osiModel,
    packetJourney,
    ipAddressing,
    dnsResolution,
    tcpHandshakeLesson,
    tlsHandshakeLesson,
  ],
  labs: [subnetLab, handshakeLab],
  simulators,
});
