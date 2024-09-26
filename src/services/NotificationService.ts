import Play from 'play-sound'

const player = Play({})

export enum NotificationSoundType {
    FOUND = 'found',
    COMPLETED = 'completed',
    ERROR = 'error'
}

export class NotificationService {
  static playSound (type: NotificationSoundType) {
    player.play(`./src/media/alert-${type}.mp3`, (err: any) => {
      if (err) console.log(`Could not play sound: ${err}`)
    })
  }
}
