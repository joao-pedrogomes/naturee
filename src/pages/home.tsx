import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="secondary">scaffold ready</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          React + TypeScript + shadcn/ui
        </h1>
        <p className="text-muted-foreground">
          Vite, Tailwind v4, React Router and the shadcn component set are wired
          up. Replace this page with the real UX flow.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Smoke test</CardTitle>
          <CardDescription>Confirms styling and interaction work.</CardDescription>
          <CardAction>
            <Badge>demo</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="you@example.com" />
            <FieldDescription>Nothing is submitted anywhere.</FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => toast.success('Components are working')}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
