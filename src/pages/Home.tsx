import { useTranslation } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

export function Home() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.username)

  return (
    <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center justify-center">
      <img
        src="/icon.png"
        alt="AuthSteem"
        className="w-16 h-16 md:w-20 md:h-20 mb-4 object-contain"
      />
      <h4 className="text-lg font-medium text-muted-foreground mb-4">{t('home.title')}</h4>
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">{t('home.heroTitle')}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t('home.heroDescription')}
      </p>
      {username ? (
        <p className="text-muted-foreground mb-8">
          {t('home.loggedInAs', { username })}
        </p>
      ) : (
        <p className="text-muted-foreground mb-8">
          {t('home.importOrLogin')}
        </p>
      )}
    </div>
  )
}
