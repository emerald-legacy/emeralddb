import type { ReactNode, MouseEvent, JSX } from 'react'
import { useNavigate } from 'react-router'
import { styled } from '@mui/material/styles'

const StyledLink = styled('a')({
  color: 'inherit',
  textDecoration: 'none',
  display: 'inline',
  '&:hover': {
    textDecoration: 'underline',
  },
})

export function EmeraldDBLink(props: {
  href: string
  onClick?: () => void
  children: ReactNode
  notClickable?: boolean
  openInNewTab?: boolean
  onMouseEnter?: (event: MouseEvent<HTMLAnchorElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLAnchorElement>) => void
}): JSX.Element {
  const navigate = useNavigate()

  function goTo(route: string) {
    navigate(route)
  }

  function onLinkClick(event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) {
    if (!props.openInNewTab) {
      event.preventDefault()
    }
    event.stopPropagation()
    if (props.onClick) {
      props.onClick()
    }
    if (!props.notClickable && !props.openInNewTab) {
      goTo(props.href)
    }
  }

  return (
    <StyledLink
      href={props.href}
      onClick={onLinkClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      target={props.openInNewTab ? '_blank' : '_self'}
      style={{
        cursor: props.notClickable ? 'default' : 'pointer',
      }}
    >
      {props.children}
    </StyledLink>
  )
}
