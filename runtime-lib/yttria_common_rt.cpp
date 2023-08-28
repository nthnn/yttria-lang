#ifndef YTTRIA_COMMON_RT_HPP
#define YTTRIA_COMMON_RT_HPP

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const char* __yttria_concat_str(const char* x, const char* y) {
    char* result = (char*) malloc(
        strlen(x) +
        strlen(y) +
        1
    );

    if(result == NULL)
        return "nil";

    strcpy(result, x);
    strcat(result, y);

    return result;
}

#endif