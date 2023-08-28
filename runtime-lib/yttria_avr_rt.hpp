#ifndef YTTRIA_AVR_RT_HPP
#define YTTRIA_AVR_RT_HPP

#include <avr/io.h>
#include <util/delay.h>

#define HIGH 0x1
#define LOW  0x0

#define INPUT 0x0
#define OUTPUT 0x1

#ifdef __cplusplus
extern "C" {
#endif

void __yttria_pin_setup(uint8_t port, uint8_t pinNumber, uint8_t mode) {
    switch(port) {
        case 'B':
        case 'b':
            if(mode == OUTPUT)
                DDRB |= (1 << pinNumber);
            else if(mode == INPUT)
                DDRB &= ~(1 << pinNumber);
            break;

        case 'C':
        case 'c':
            if(mode == OUTPUT)
                DDRC |= (1 << pinNumber);
            else if (mode == INPUT)
                DDRC &= ~(1 << pinNumber);
            break;

        case 'D':
        case 'd':
            if (mode == OUTPUT)
                DDRD |= (1 << pinNumber);
            else if (mode == INPUT)
                DDRD &= ~(1 << pinNumber);
            break;

        default:
            break;
    }
}

void __yttria_digital_write(uint8_t port, uint8_t pinNumber, uint8_t value) {
    switch(port) {
        case 'B':
        case 'b':
            if(value == HIGH)
                PORTB |= (1 << pinNumber);
            else if(value == LOW)
                PORTB &= ~(1 << pinNumber);
            break;

        case 'C':
        case 'c':
            if(value == HIGH)
                PORTC |= (1 << pinNumber);
            else if (value == LOW)
                PORTC &= ~(1 << pinNumber);
            break;

        case 'D':
        case 'd':
            if (value == HIGH)
                PORTD |= (1 << pinNumber);
            else if (value == LOW)
                PORTD &= ~(1 << pinNumber);
            break;

        default:
            break;
    }
}

uint8_t __yttria_digital_read(uint8_t port, uint8_t pinNumber) {
    switch (port) {
        case 'B':
        case 'b':
            return (PINB >> pinNumber) & 0x01;

        case 'C':
        case 'c':
            return (PINC >> pinNumber) & 0x01;

        case 'D':
        case 'd':
            return (PIND >> pinNumber) & 0x01;

        default:
            return 0;
    }
}

void __yttria_uart_init(uint32_t baudRate) {
    uint16_t ubrrValue = (F_CPU / (16 * baudRate)) - 1;
    
    UBRR0H = (uint8_t)(ubrrValue >> 8);
    UBRR0L = (uint8_t)ubrrValue;
    UCSR0B = (1 << TXEN0);
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}

void __yttria_uart_wait() {
    while(!(UCSR0A & (1 << UDRE0)));
}

void __yttria_uart_write(char data) {
    uart_wait();
    UDR0 = data;
}

void __yttria_uart_print(const char* str) {
    while(*str != '\0') {
        uart_write(*str);
        str++;
    }
}

#ifdef __cplusplus
}
#endif

#endif